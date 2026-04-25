#!/usr/bin/env python3
"""Deploy barber shop app to Hostinger server via SSH/SFTP."""

import paramiko
import os
import sys
import stat

# Server config
HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

# Remote paths
REMOTE_BASE = "/home/u492425110/barber-app"
REMOTE_PUBLIC = "/home/u492425110/domains/barmagly.tech/public_html/barber"

def create_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    return ssh

def create_sftp(ssh):
    return ssh.open_sftp()

def sftp_mkdir_p(sftp, remote_dir):
    """Recursively create remote directory."""
    dirs = []
    d = remote_dir
    while d and d != '/':
        try:
            sftp.stat(d)
            break
        except FileNotFoundError:
            dirs.append(d)
            d = os.path.dirname(d)
    for d in reversed(dirs):
        try:
            sftp.mkdir(d)
        except:
            pass

def upload_dir(sftp, local_dir, remote_dir, label=""):
    """Upload entire directory recursively."""
    count = 0
    for root, dirs, files in os.walk(local_dir):
        rel = os.path.relpath(root, local_dir).replace("\\", "/")
        remote_path = remote_dir if rel == "." else f"{remote_dir}/{rel}"
        sftp_mkdir_p(sftp, remote_path)
        for f in files:
            local_file = os.path.join(root, f)
            remote_file = f"{remote_path}/{f}"
            sftp.put(local_file, remote_file)
            count += 1
    print(f"  [{label}] Uploaded {count} files to {remote_dir}")

def upload_file(sftp, local_path, remote_path):
    sftp_mkdir_p(sftp, os.path.dirname(remote_path))
    sftp.put(local_path, remote_path)
    print(f"  Uploaded {os.path.basename(local_path)} -> {remote_path}")

def run_cmd(ssh, cmd, label=""):
    print(f"  [{label}] Running: {cmd[:80]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    if out.strip():
        print(f"    stdout: {out.strip()[:200]}")
    if err.strip():
        print(f"    stderr: {err.strip()[:200]}")
    return code, out, err

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    print("=" * 60)
    print("DEPLOYING BARBER SHOP APP TO barmagly.tech/barber")
    print("=" * 60)

    # 1. Connect
    print("\n[1/7] Connecting to server...")
    ssh = create_ssh()
    sftp = create_sftp(ssh)
    print("  Connected!")

    # 2. Upload server bundle
    print("\n[2/7] Uploading server bundle...")
    sftp_mkdir_p(sftp, f"{REMOTE_BASE}/server_dist")
    upload_file(sftp, "server_dist/index.js", f"{REMOTE_BASE}/server_dist/index.js")
    upload_file(sftp, "server_dist/seed.js", f"{REMOTE_BASE}/server_dist/seed.js")

    # 3. Upload admin panel
    print("\n[3/7] Uploading admin panel...")
    upload_dir(sftp, "admin-dist", f"{REMOTE_BASE}/admin-dist", "admin")

    # 4. Upload Expo web build
    print("\n[4/7] Uploading Expo web build...")
    upload_dir(sftp, "dist", f"{REMOTE_PUBLIC}", "expo-web")

    # Also copy index.html to the barber-app dir for serving
    # The PHP proxy handles routing, but we keep the static files in public_html/barber

    # 5. Run seed to populate English/Swiss data
    print("\n[5/7] Running database seed (English/Swiss data)...")
    seed_cmd = f"cd {REMOTE_BASE} && FORCE_SEED=true node server_dist/seed.js"
    code, out, err = run_cmd(ssh, seed_cmd, "seed")
    if code != 0:
        print(f"  WARNING: Seed exited with code {code}")
    else:
        print("  Seed completed successfully!")

    # 6. Restart the Node.js server
    print("\n[6/7] Restarting Node.js server...")
    # Kill existing node process
    run_cmd(ssh, "pkill -f 'node server_dist/index.js' || true", "kill")
    # Start fresh
    start_cmd = f'cd {REMOTE_BASE} && bash -c "nohup node server_dist/index.js > server.log 2>&1 & disown; echo started"'
    code, out, err = run_cmd(ssh, start_cmd, "start")

    # Wait and check if it's running
    import time
    time.sleep(3)
    code, out, err = run_cmd(ssh, "pgrep -f 'node server_dist/index.js' || echo 'NOT RUNNING'", "check")
    if "NOT RUNNING" in out:
        print("  WARNING: Server may not be running. Checking logs...")
        run_cmd(ssh, f"tail -20 {REMOTE_BASE}/server.log", "logs")
    else:
        print(f"  Server running (PID: {out.strip()})")

    # 7. Verify deployment
    print("\n[7/7] Verifying deployment...")
    # Check admin panel
    code, out, err = run_cmd(ssh, f"ls -la {REMOTE_BASE}/admin-dist/index.html 2>&1", "verify-admin")
    # Check expo web
    code, out, err = run_cmd(ssh, f"ls -la {REMOTE_PUBLIC}/index.html 2>&1", "verify-expo")
    # Check server log
    run_cmd(ssh, f"tail -5 {REMOTE_BASE}/server.log", "server-log")

    sftp.close()
    ssh.close()

    print("\n" + "=" * 60)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print(f"\nURLs:")
    print(f"  Main App:    https://barmagly.tech/barber/")
    print(f"  Admin Panel: https://barmagly.tech/barber/super_admin")
    print(f"  API:         https://barmagly.tech/barber/api/salons")
    print()

if __name__ == "__main__":
    main()
