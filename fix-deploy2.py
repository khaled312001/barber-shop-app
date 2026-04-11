#!/usr/bin/env python3
"""Fix deployment v2 - upload rebuilt frontend files with /barber/ base paths"""
import paramiko
import os

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
            print(f"  -> {remote_path}")
            sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            try:
                sftp.stat(remote_path)
            except FileNotFoundError:
                sftp.mkdir(remote_path)
            upload_dir(sftp, local_path, remote_path)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
sftp = client.open_sftp()

# Step 1: Upload Expo web (from dist/)
print("=== [1] Uploading Expo web frontend ===")
run(client, f"rm -rf {BARBER_DIR}/_expo {BARBER_DIR}/index.html {BARBER_DIR}/favicon.ico {BARBER_DIR}/metadata.json")

local_dist = r"E:\barber-shop-app\dist"

# Upload index.html, favicon, metadata
for f in ["index.html", "favicon.ico", "metadata.json"]:
    local_f = os.path.join(local_dist, f)
    if os.path.exists(local_f):
        sftp.put(local_f, f"{BARBER_DIR}/{f}")
        print(f"  -> {f}")

# Upload _expo directory
run(client, f"mkdir -p {BARBER_DIR}/_expo/static/css {BARBER_DIR}/_expo/static/js/web")
upload_dir(sftp, os.path.join(local_dist, "_expo"), f"{BARBER_DIR}/_expo")

# Step 2: Upload admin panel (from admin-dist/)
print("\n=== [2] Uploading admin panel ===")
run(client, f"rm -rf {BARBER_DIR}/super_admin")
run(client, f"mkdir -p {BARBER_DIR}/super_admin/assets")

upload_dir(sftp, r"E:\barber-shop-app\admin-dist", f"{BARBER_DIR}/super_admin")

# Step 3: Verify
print("\n=== [3] File check ===")
run(client, f"ls -la {BARBER_DIR}/")
run(client, f"find {BARBER_DIR}/_expo -type f")
run(client, f"ls -la {BARBER_DIR}/super_admin/")

# Step 4: Test all URLs
print("\n=== [4] URL Tests ===")

tests = [
    ('Main App', 'https://barmagly.tech/barber/'),
    ('Admin Panel', 'https://barmagly.tech/barber/super_admin/'),
    ('Health', 'https://barmagly.tech/barber/health'),
    ('API Salons', 'https://barmagly.tech/barber/api/salons'),
]

for name, url in tests:
    out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
    body, _ = run(client, f"curl -s '{url}' 2>&1 | head -c 200", show=False)
    status = out.strip()
    print(f"  {name}: {status}")
    if 'api' in url.lower() or 'health' in url.lower():
        print(f"    {body[:150]}")

# Asset tests
print("\nAsset availability:")
assets = {
    'Expo CSS': f"https://barmagly.tech/barber/_expo/static/css/native-tabs.module-78b0f59737571f455720970791a36bdd.css",
    'Expo JS': f"https://barmagly.tech/barber/_expo/static/js/web/entry-9e3db32b96092ef16fa8feceb0b4b186.js",
}

# Find admin JS/CSS filenames
admin_out, _ = run(client, f"ls {BARBER_DIR}/super_admin/assets/", show=False)
for f in admin_out.strip().split('\n'):
    f = f.strip()
    if f.endswith('.js'):
        assets['Admin JS'] = f"https://barmagly.tech/barber/super_admin/assets/{f}"
    elif f.endswith('.css'):
        assets['Admin CSS'] = f"https://barmagly.tech/barber/super_admin/assets/{f}"

for name, url in assets.items():
    out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
    print(f"  {name}: {out.strip()}")

sftp.close()
client.close()

print("\n=== DONE ===")
print("Main App:    https://barmagly.tech/barber/")
print("Admin Panel: https://barmagly.tech/barber/super_admin/")
