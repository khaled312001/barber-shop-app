#!/usr/bin/env python3
"""Verify everything works after backend restart"""
import paramiko

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

def run(client, cmd, show=False, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    return out.strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

tests = [
    ('Main App', 'https://barmagly.tech/barber/'),
    ('Admin Panel', 'https://barmagly.tech/barber/super_admin/'),
    ('Health API', 'https://barmagly.tech/barber/health'),
    ('Salons API', 'https://barmagly.tech/barber/api/salons'),
    ('Auth API', 'https://barmagly.tech/barber/api/auth/me'),
    ('Expo CSS', 'https://barmagly.tech/barber/_expo/static/css/native-tabs.module-78b0f59737571f455720970791a36bdd.css'),
    ('Expo JS', 'https://barmagly.tech/barber/_expo/static/js/web/entry-9e3db32b96092ef16fa8feceb0b4b186.js'),
]

print("=== Full Verification ===\n")
for name, url in tests:
    status = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1")
    icon = 'OK' if status == '200' else 'FAIL'
    print(f"  [{icon}] {name}: {status}  {url}")

# Check salon count from new seed
body = run(client, "curl -s 'https://barmagly.tech/barber/api/salons' 2>&1")
import json
try:
    salons = json.loads(body)
    print(f"\n  Salons in DB: {len(salons)}")
    for s in salons:
        print(f"    - {s['name']} ({s.get('status','?')})")
except:
    print(f"\n  API response: {body[:200]}")

client.close()
