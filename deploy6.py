#!/usr/bin/env python3
"""Check status and verify deployment"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"

def run(client, cmd, show=True, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    if show and err and 'grep' not in cmd:
        print(f"ERR: {err[:500]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Kill any existing and restart fresh
print("[1] Killing existing process...")
run(client, "pkill -f 'node.*server_dist' 2>/dev/null", show=False)
time.sleep(2)

# Start
print("[2] Starting app...")
client.exec_command(f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &")
time.sleep(6)

# Check process
print("\n[3] Process check:")
out, _ = run(client, "ps aux | grep 'server_dist' | grep -v grep")

# Check logs
print("\n[4] App logs:")
out, _ = run(client, f"tail -30 {APP_DIR}/app.log")

# Health check
print("\n[5] Health check:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1")
print(f"Result: {out}")

# Salons
print("\n[6] Salons API:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/api/salons 2>&1 | head -c 300")
print(f"Result: {out[:300]}")

# External check
print("\n[7] External URL check:")
out, _ = run(client, "curl -s -o /dev/null -w '%{http_code}' https://barber.barmagly.tech/health 2>&1")
print(f"HTTPS status: {out}")

out, _ = run(client, "curl -s https://barber.barmagly.tech/health 2>&1 | head -c 200")
print(f"Response: {out[:200]}")

client.close()
