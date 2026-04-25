#!/usr/bin/env python3
"""Deploy i18n-updated builds to server"""
import paramiko
import os
import stat

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

PUBLIC_HTML = f"/home/{USER}/domains/barmagly.tech/public_html"
BARBER_DIR = f"{PUBLIC_HTML}/barber"

def run(client, cmd, show=True, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    if show and err and 'grep' not in cmd:
        print(f"ERR: {err[:1000]}")
    return out, err

def upload_dir(sftp, local_dir, remote_dir):
    """Recursively upload a directory"""
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        if os.path.isfile(local_path):
            print(f"  Uploading {item}")
            sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            try:
                sftp.stat(remote_path)
            except FileNotFoundError:
                sftp.mkdir(remote_path)
            upload_dir(sftp, local_path, remote_path)

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, PORT, USER, PASS)
    sftp = client.open_sftp()

    # 1. Upload admin panel build
    print("=== Uploading admin-dist ===")
    admin_local = "e:/barber-shop-app/admin-dist"
    admin_remote = f"{BARBER_DIR}/super_admin"
    try:
        sftp.stat(admin_remote)
    except FileNotFoundError:
        sftp.mkdir(admin_remote)
    upload_dir(sftp, admin_local, admin_remote)
    print("Admin panel uploaded.")

    # 2. Upload Expo web build (dist/)
    print("\n=== Uploading Expo web (dist/) ===")
    # Upload index.html
    sftp.put("e:/barber-shop-app/dist/index.html", f"{BARBER_DIR}/index.html")
    print("  index.html uploaded")

    # Upload _expo directory
    expo_local = "e:/barber-shop-app/dist/_expo"
    expo_remote = f"{BARBER_DIR}/_expo"
    try:
        sftp.stat(expo_remote)
    except FileNotFoundError:
        sftp.mkdir(expo_remote)
    upload_dir(sftp, expo_local, expo_remote)
    print("Expo web uploaded.")

    # Upload favicon
    try:
        sftp.put("e:/barber-shop-app/dist/favicon.ico", f"{BARBER_DIR}/favicon.ico")
        print("  favicon uploaded")
    except:
        pass

    # 3. Upload server bundle
    print("\n=== Uploading server bundle ===")
    try:
        sftp.stat(f"{BARBER_DIR}/server_dist")
    except FileNotFoundError:
        sftp.mkdir(f"{BARBER_DIR}/server_dist")
    sftp.put("e:/barber-shop-app/server_dist/index.js", f"{BARBER_DIR}/server_dist/index.js")
    print("Server bundle uploaded.")

    # 4. Restart backend
    print("\n=== Restarting backend ===")
    run(client, f"cd {BARBER_DIR} && pkill -f 'node server_dist/index.js' 2>/dev/null; sleep 1; nohup node server_dist/index.js > server.log 2>&1 &")
    import time
    time.sleep(3)
    run(client, f"cd {BARBER_DIR} && tail -20 server.log")

    # 5. Quick check
    print("\n=== Checking server ===")
    run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/salons")

    sftp.close()
    client.close()
    print("\n=== Deployment complete! ===")

if __name__ == "__main__":
    main()
