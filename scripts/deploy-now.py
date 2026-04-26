"""Deploy current build to barber.barmagly.tech."""
import paramiko
import os
import time
import stat as stat_mod

HOST, PORT, USER, PASS = "147.93.54.132", 65002, "u492425110", "support@Passord123"
REMOTE_PUBLIC = "/home/u492425110/domains/barmagly.tech/public_html/barber"
REMOTE_BASE = "/home/u492425110/barber-app"


def sftp_mkdir_p(sftp, d):
    dirs = []
    while d and d != "/":
        try:
            sftp.stat(d)
            break
        except FileNotFoundError:
            dirs.append(d)
            d = os.path.dirname(d)
    for x in reversed(dirs):
        try:
            sftp.mkdir(x)
        except Exception:
            pass


def rmtree_remote(sftp, path):
    try:
        for entry in sftp.listdir_attr(path):
            full = f"{path}/{entry.filename}"
            if stat_mod.S_ISDIR(entry.st_mode):
                rmtree_remote(sftp, full)
            else:
                try:
                    sftp.remove(full)
                except Exception:
                    pass
        try:
            sftp.rmdir(path)
        except Exception:
            pass
    except FileNotFoundError:
        pass


def upload_dir(sftp, local, remote, label):
    count = 0
    for root, _, files in os.walk(local):
        rel = os.path.relpath(root, local).replace(os.sep, "/")
        rpath = remote if rel == "." else f"{remote}/{rel}"
        sftp_mkdir_p(sftp, rpath)
        for f in files:
            sftp.put(os.path.join(root, f), f"{rpath}/{f}")
            count += 1
    print(f"  [{label}] Uploaded {count} files")


def upload_file(sftp, local_path, remote_path):
    sftp_mkdir_p(sftp, os.path.dirname(remote_path))
    sftp.put(local_path, remote_path)
    print(f"  Uploaded {os.path.basename(local_path)}")


def run_cmd(ssh, cmd, label=""):
    print(f"  [{label}] {cmd[:120]}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out.strip():
        print(f"    {out.strip()[:400]}")
    if err.strip() and "Warning" not in err:
        print(f"    ERR: {err.strip()[:300]}")
    return out


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    print("=" * 60)
    print("DEPLOYING TO barber.barmagly.tech")
    print("=" * 60)

    ssh = None
    sftp = None
    last_err = None
    for attempt in range(1, 7):
        try:
            print(f"\n[1/6] Connecting (attempt {attempt}/6)...")
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30, banner_timeout=30, auth_timeout=30)
            time.sleep(1)
            sftp = ssh.open_sftp()
            print("  Connected!")
            break
        except Exception as e:
            last_err = e
            print(f"  attempt {attempt} failed: {e}")
            try:
                if ssh: ssh.close()
            except Exception: pass
            time.sleep(3 * attempt)
    if not sftp:
        raise last_err

    # 2. Replace _expo build dir to avoid stale chunks
    print("\n[2/6] Removing stale _expo dir...")
    rmtree_remote(sftp, f"{REMOTE_PUBLIC}/_expo")
    print("  done.")

    # Upload Expo web build (dist/)
    print("\n[3/6] Uploading Expo web build (dist/)...")
    if not os.path.isdir("dist/_expo"):
        print("  ERROR: dist/_expo not found. Run `npx expo export --platform web` first.")
        return
    upload_dir(sftp, "dist/_expo", f"{REMOTE_PUBLIC}/_expo", "expo-web")
    # also copy assets if any
    if os.path.isdir("dist/assets"):
        upload_dir(sftp, "dist/assets", f"{REMOTE_PUBLIC}/assets", "expo-assets")
    if os.path.isfile("dist/favicon.ico"):
        upload_file(sftp, "dist/favicon.ico", f"{REMOTE_PUBLIC}/favicon.ico")

    # 4. Upload server bundle + PHP router
    print("\n[4/6] Uploading server bundle and PHP router...")
    upload_file(sftp, "server_dist/index.js", f"{REMOTE_BASE}/server_dist/index.js")
    upload_file(sftp, "subdomain-index.php", f"{REMOTE_PUBLIC}/index.php")

    # 5. Restart Node via watchdog (kill node, watchdog will respawn or kick a fresh start)
    print("\n[5/6] Restarting Node server...")
    # Try touching the source then send TERM to existing node so watchdog respawns it
    run_cmd(ssh, "pkill -f 'node server_dist/index.js' || true", "kill-node")
    time.sleep(2)
    # If watchdog isn't running, start it manually in background
    run_cmd(ssh, "pgrep -f 'watchdog.js' || nohup node /home/u492425110/barber-app/watchdog.js > /home/u492425110/barber-app/watchdog.log 2>&1 & echo started_watchdog", "watchdog")
    time.sleep(3)

    # 6. Verify
    print("\n[6/6] Verifying...")
    run_cmd(ssh, "pgrep -fa 'node server_dist/index.js' || echo NOT_RUNNING", "check-node")
    run_cmd(ssh, f"tail -10 {REMOTE_BASE}/server.log 2>/dev/null || echo no-log", "server-log")

    sftp.close()
    ssh.close()

    print("\n" + "=" * 60)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print("\nURLs:")
    print("  App:   https://barber.barmagly.tech/home")
    print("  Admin: https://barber.barmagly.tech/super_admin")
    print("  API:   https://barber.barmagly.tech/api/salons")


if __name__ == "__main__":
    main()
