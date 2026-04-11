#!/usr/bin/env python3
"""Fix deployment - upload corrected frontend files with proper /barber/ base paths"""
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
            print(f"  Uploading: {remote_path}")
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

# Step 1: Upload fixed Expo web build (main app)
print("=== [1] Uploading fixed Expo web frontend ===")

# Clean old files
run(client, f"rm -rf {BARBER_DIR}/_expo {BARBER_DIR}/favicon.ico {BARBER_DIR}/index.html")

# Upload fixed index.html
local_dist = r"E:\barber-shop-app\dist"
print(f"  Uploading index.html...")
sftp.put(os.path.join(local_dist, "index.html"), f"{BARBER_DIR}/index.html")

# Upload favicon if exists
favicon = os.path.join(local_dist, "favicon.ico")
if os.path.exists(favicon):
    sftp.put(favicon, f"{BARBER_DIR}/favicon.ico")

# Upload _expo directory
expo_local = os.path.join(local_dist, "_expo")
if os.path.exists(expo_local):
    run(client, f"mkdir -p {BARBER_DIR}/_expo/static/css {BARBER_DIR}/_expo/static/js/web")
    upload_dir(sftp, expo_local, f"{BARBER_DIR}/_expo")
    print("  _expo directory uploaded")

# Step 2: Upload fixed admin panel
print("\n=== [2] Uploading fixed admin panel ===")
run(client, f"rm -rf {BARBER_DIR}/super_admin/*")
run(client, f"mkdir -p {BARBER_DIR}/super_admin/assets")

admin_local = r"E:\barber-shop-app\admin-dist"
upload_dir(sftp, admin_local, f"{BARBER_DIR}/super_admin")
print("  Admin panel uploaded")

# Step 3: Recreate .htaccess for barber subfolder (important!)
print("\n=== [3] Writing .htaccess for /barber/ ===")
barber_htaccess = """DirectoryIndex index.html index.php

RewriteEngine On

# Serve existing static files directly
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Serve existing directories with index files
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# super_admin SPA - serve index.html for all sub-routes
RewriteCond %{REQUEST_URI} ^/barber/super_admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /barber/super_admin/index.html [L]

# API/backend routes -> PHP proxy
RewriteCond %{REQUEST_URI} ^/barber/api [OR]
RewriteCond %{REQUEST_URI} ^/barber/health [OR]
RewriteCond %{REQUEST_URI} ^/barber/salon/
RewriteRule ^(.*)$ index.php [QSA,L]

# SPA fallback for Expo web - serve index.html for all other routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
"""
with sftp.open(f"{BARBER_DIR}/.htaccess", 'w') as f:
    f.write(barber_htaccess)
print("  .htaccess written")

# Step 4: Verify files are in place
print("\n=== [4] Verification ===")
print("Barber root:")
run(client, f"ls -la {BARBER_DIR}/")
print("\n_expo structure:")
run(client, f"find {BARBER_DIR}/_expo -type f 2>/dev/null | head -10")
print("\nsuper_admin:")
run(client, f"ls -la {BARBER_DIR}/super_admin/")
print("\nindex.html content (first 5 lines):")
run(client, f"head -5 {BARBER_DIR}/index.html")

# Step 5: Test URLs
print("\n=== [5] Testing URLs ===")
urls = [
    'https://barmagly.tech/barber/',
    'https://barmagly.tech/barber/super_admin/',
    'https://barmagly.tech/barber/health',
    'https://barmagly.tech/barber/api/salons',
]
for url in urls:
    out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
    body, _ = run(client, f"curl -s '{url}' 2>&1 | head -c 200", show=False)
    print(f"  {url}")
    print(f"    Status: {out.strip()}")
    print(f"    Body: {body[:150]}")

# Check that CSS/JS assets load
print("\nAsset checks:")
css_url = "https://barmagly.tech/barber/_expo/static/css/native-tabs.module-78b0f59737571f455720970791a36bdd.css"
out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{css_url}' 2>&1", show=False)
print(f"  Expo CSS: {out.strip()}")

js_url = "https://barmagly.tech/barber/_expo/static/js/web/entry-b300a21dcba272e800a60fe96dc561fd.js"
out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{js_url}' 2>&1", show=False)
print(f"  Expo JS: {out.strip()}")

admin_js_url = "https://barmagly.tech/barber/super_admin/assets/index-DgEfF8h2.js"
out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{admin_js_url}' 2>&1", show=False)
print(f"  Admin JS: {out.strip()}")

admin_css_url = "https://barmagly.tech/barber/super_admin/assets/index-DATzUnDU.css"
out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{admin_css_url}' 2>&1", show=False)
print(f"  Admin CSS: {out.strip()}")

sftp.close()
client.close()

print("\n=== DONE ===")
print("Main App:    https://barmagly.tech/barber/")
print("Admin Panel: https://barmagly.tech/barber/super_admin/")
