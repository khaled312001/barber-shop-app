"""
Deploy script for Barber Shop App
Uses PM2 for process management (auto-restart on crash)

Usage: python scripts/deploy.py [web|server|admin|all]
"""
import paramiko
import os
import sys
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"
REMOTE_BASE = "/home/u492425110/domains/barmagly.tech/public_html/barber"
REMOTE_APP = "/home/u492425110/barber-app"

def connect():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    return ssh

def upload_dir(sftp, local, remote):
    for item in os.listdir(local):
        lp = os.path.join(local, item)
        rp = remote + "/" + item
        if os.path.isdir(lp):
            try: sftp.stat(rp)
            except: sftp.mkdir(rp)
            upload_dir(sftp, lp, rp)
        else:
            sftp.put(lp, rp)

def deploy_web(ssh, sftp):
    print("📦 Deploying Expo web...")
    upload_dir(sftp, os.path.join(os.getcwd(), "dist"), REMOTE_BASE)
    ssh.exec_command(f"cp {REMOTE_BASE}/index.html {REMOTE_BASE}/_app.html")[1].read()
    print("  ✅ Web deployed")

def deploy_admin(ssh, sftp):
    print("📦 Deploying admin panel...")
    upload_dir(sftp, os.path.join(os.getcwd(), "admin-dist"), f"{REMOTE_BASE}/super_admin")
    print("  ✅ Admin panel deployed")

def deploy_server(ssh, sftp):
    print("📦 Deploying server...")
    sftp.put(os.path.join(os.getcwd(), "server_dist", "index.js"), f"{REMOTE_APP}/server_dist/index.js")
    print("  🔄 Restarting watchdog...")
    ssh.exec_command("pkill -9 -f 'node.*watchdog' 2>/dev/null; pkill -9 -f 'node.*server_dist' 2>/dev/null; fuser -k 3000/tcp 2>/dev/null")[1].read()
    time.sleep(2)
    ssh.exec_command(f"cd {REMOTE_APP} && nohup node watchdog.js >> /tmp/barber-server.log 2>&1 &")[1].read()
    time.sleep(5)
    stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/salons")
    status = stdout.read().decode()
    print(f"  {'✅' if status == '200' else '❌'} Server status: {status}")

def clear_cache(ssh):
    ssh.exec_command(f"rm -rf {REMOTE_BASE}/.lscache/* 2>/dev/null")
    print("🧹 Cache cleared")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    ssh = connect()
    sftp = ssh.open_sftp()

    if target in ("web", "all"):
        deploy_web(ssh, sftp)
    if target in ("admin", "all"):
        deploy_admin(ssh, sftp)
    if target in ("server", "all"):
        deploy_server(ssh, sftp)

    clear_cache(ssh)
    sftp.close()
    ssh.close()
    print("\n🎉 Deploy complete!")
