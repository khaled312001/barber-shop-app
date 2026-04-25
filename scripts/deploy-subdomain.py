"""Deploy everything to barber.barmagly.tech subdomain."""
import paramiko
import os
import time

HOST, PORT, USER, PASS = "82.198.227.175", 65002, "u492425110", "support@Passord123"
REMOTE_PUBLIC = "/home/u492425110/domains/barber.barmagly.tech/public_html"
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
        except:
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
    print(f"  [{label}] {cmd[:80]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out.strip():
        print(f"    {out.strip()[:300]}")
    if err.strip() and "Warning" not in err:
        print(f"    ERR: {err.strip()[:200]}")
    return out

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    print("=" * 60)
    print("DEPLOYING TO barber.barmagly.tech")
    print("=" * 60)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("\n[1/7] Connecting...")
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()
    print("  Connected!")

    # 2. Upload Expo web build to public_html
    print("\n[2/7] Uploading Expo web build...")
    upload_dir(sftp, "static-build", REMOTE_PUBLIC, "expo-web")
    # Rename index.html to _app.html for PHP router
    try:
        try:
            sftp.remove(f"{REMOTE_PUBLIC}/_app.html")
        except:
            pass
        sftp.rename(f"{REMOTE_PUBLIC}/index.html", f"{REMOTE_PUBLIC}/_app.html")
        print("  Renamed index.html -> _app.html")
    except Exception as e:
        print(f"  Note: {e}")

    # 3. Upload admin panel
    print("\n[3/7] Uploading admin panel...")
    upload_dir(sftp, "admin-dist", f"{REMOTE_PUBLIC}/super_admin", "admin")

    # 4. Upload server bundle
    print("\n[4/7] Uploading server bundle...")
    sftp_mkdir_p(sftp, f"{REMOTE_BASE}/server_dist")
    upload_file(sftp, "server_dist/index.js", f"{REMOTE_BASE}/server_dist/index.js")

    # 5. Upload .env
    print("\n[5/7] Uploading .env...")
    upload_file(sftp, ".env", f"{REMOTE_BASE}/.env")

    # 6. Upload PHP router
    print("\n[6/7] Uploading PHP router...")
    upload_file(sftp, "subdomain-index.php", f"{REMOTE_PUBLIC}/index.php")

    # 7. Restart Node.js server
    print("\n[7/7] Restarting server...")
    run_cmd(ssh, "pkill -f 'node server_dist/index.js' || true", "kill")
    time.sleep(2)
    start_cmd = f'cd {REMOTE_BASE} && bash -c "nohup node server_dist/index.js > server.log 2>&1 & disown; echo started"'
    run_cmd(ssh, start_cmd, "start")
    time.sleep(3)
    run_cmd(ssh, "pgrep -f 'node server_dist/index.js' || echo 'NOT RUNNING'", "check")
    run_cmd(ssh, f"tail -5 {REMOTE_BASE}/server.log", "logs")

    sftp.close()
    ssh.close()

    print("\n" + "=" * 60)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print("\nURLs:")
    print("  App:   https://barber.barmagly.tech/")
    print("  AI:    https://barber.barmagly.tech/ai-makeover")
    print("  Admin: https://barber.barmagly.tech/super_admin")
    print("  API:   https://barber.barmagly.tech/api/salons")

if __name__ == "__main__":
    main()
