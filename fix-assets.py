#!/usr/bin/env python3
"""Fix asset paths - create symlink for /assets/ at main domain level"""
import paramiko

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
    if show and err:
        print(f"ERR: {err[:500]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# The Expo bundle requests fonts at /assets/node_modules/... (absolute from root)
# We need to make these accessible. Create a symlink at the main public_html level.

print("[1] Checking if /assets/ already exists at main public_html...")
run(client, f"ls -la {PUBLIC_HTML}/assets 2>/dev/null || echo 'No assets dir'")

# Create symlink from public_html/assets -> public_html/barber/assets
print("\n[2] Creating symlink for /assets/...")
run(client, f"ln -sf {BARBER_DIR}/assets {PUBLIC_HTML}/assets 2>/dev/null")
run(client, f"ls -la {PUBLIC_HTML}/assets")

# Test a font URL at /assets/ (without /barber/)
print("\n[3] Testing font access at /assets/ level...")
out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' 'https://barmagly.tech/assets/node_modules/@expo-google-fonts/urbanist/700Bold/Urbanist_700Bold.f1be12677cd5a989d8851a7743ea9b9e.ttf' 2>&1", show=False)
print(f"  Font at /assets/: {out.strip()}")

# Also test fonts at /barber/assets/
out2, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' 'https://barmagly.tech/barber/assets/node_modules/@expo-google-fonts/urbanist/700Bold/Urbanist_700Bold.f1be12677cd5a989d8851a7743ea9b9e.ttf' 2>&1", show=False)
print(f"  Font at /barber/assets/: {out2.strip()}")

# Test main pages
print("\n[4] Page tests:")
for url in ['https://barmagly.tech/barber/', 'https://barmagly.tech/barber/super_admin/']:
    out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
    print(f"  {url}: {out.strip()}")

client.close()
print("\nDone! Try refreshing the pages now.")
