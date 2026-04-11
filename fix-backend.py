#!/usr/bin/env python3
"""Fix backend - check and restart Node.js"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"
APP_DIR = f"/home/{USER}/barber-app"
NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"

def run(client, cmd, show=True, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    if show and err and 'grep' not in cmd:
        print(f"ERR: {err[:2000]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Check if Node is running
print("[1] Checking Node.js process...")
out, _ = run(client, "ps aux | grep 'server_dist' | grep -v grep")
if not out.strip():
    print("  NOT running!")
else:
    print("  Running")

# Check logs
print("\n[2] Recent logs:")
run(client, f"tail -50 {APP_DIR}/app.log 2>/dev/null")

# Check .env
print("\n[3] Checking .env...")
run(client, f"cat {APP_DIR}/.env")

# Kill any zombie processes
print("\n[4] Killing old processes...")
run(client, "pkill -f 'node.*server_dist' 2>/dev/null", show=False)
run(client, "pkill -f 'node.*barber-app' 2>/dev/null", show=False)
time.sleep(2)

# Check start.sh
print("[5] Checking start.sh...")
run(client, f"cat {APP_DIR}/start.sh")

# Start fresh
print("\n[6] Starting Node.js...")
client.exec_command(f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &")
time.sleep(6)

# Check if it started
print("[7] Process check:")
out, _ = run(client, "ps aux | grep 'server_dist' | grep -v grep")

# Check logs after start
print("\n[8] Startup logs:")
run(client, f"tail -30 {APP_DIR}/app.log")

# Health check
print("\n[9] Health check:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1")
print(f"  Result: {out}")

# API check
print("\n[10] API check:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/api/salons 2>&1 | head -c 200")
print(f"  Result: {out[:200]}")

# External check
print("\n[11] External check:")
out, _ = run(client, "curl -s -o /dev/null -w '%{http_code}' 'https://barmagly.tech/barber/health' 2>&1", show=False)
print(f"  barmagly.tech/barber/health: {out.strip()}")
out2, _ = run(client, "curl -s 'https://barmagly.tech/barber/health' 2>&1", show=False)
print(f"  Body: {out2[:200]}")

client.close()
