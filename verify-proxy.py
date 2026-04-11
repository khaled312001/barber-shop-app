#!/usr/bin/env python3
"""Verify the PHP proxy handles /barber/api/* correctly"""
import paramiko

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

BARBER_DIR = f"/home/{USER}/domains/barmagly.tech/public_html/barber"

def run(client, cmd, show=True, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Check current PHP proxy
print("=== Current index.php ===")
run(client, f"cat {BARBER_DIR}/index.php")

# Check .htaccess
print("\n=== Current .htaccess ===")
run(client, f"cat {BARBER_DIR}/.htaccess")

# Test the API endpoint externally with verbose output
print("\n=== Testing API call path ===")
out, _ = run(client, "curl -sv https://barmagly.tech/barber/api/salons 2>&1 | head -30")

# Test auth endpoint
print("\n=== Testing auth endpoint ===")
out, _ = run(client, "curl -s https://barmagly.tech/barber/api/auth/me 2>&1 | head -c 200")
print(f"Response: {out[:200]}")

client.close()
