#!/usr/bin/env python3
"""Upload and run the full seed script on the server"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"
APP_DIR = f"/home/{USER}/barber-app"
NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"

def run(client, cmd, show=True, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:8000])
    if show and err and 'grep' not in cmd:
        print(f"ERR: {err[:2000]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Upload seed file
sftp = client.open_sftp()
sftp.put(r"E:\barber-shop-app\seed-full.js", f"{APP_DIR}/seed-full.js")
sftp.close()
print("Uploaded seed-full.js")

# Run seed
print("\n=== Running seed script ===")
out, err = run(client, f"cd {APP_DIR} && {NODE_BIN}/node seed-full.js 2>&1", timeout=120)

client.close()
