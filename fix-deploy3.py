#!/usr/bin/env python3
"""Fix deployment v3 - upload Expo assets (fonts) and rebuilt admin panel"""
import paramiko
import os

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

def upload_dir(sftp, local_dir, remote_dir, client=None):
    """Recursively upload a directory, creating remote dirs as needed"""
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        if os.path.isfile(local_path):
            size = os.path.getsize(local_path)
            if size > 0:
                print(f"  -> {remote_path} ({size//1024}KB)")
                sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            # Create remote dir via SSH command (more reliable)
            if client:
                client.exec_command(f"mkdir -p '{remote_path}'")
                import time
                time.sleep(0.1)
            else:
                try:
                    sftp.stat(remote_path)
                except FileNotFoundError:
                    sftp.mkdir(remote_path)
            upload_dir(sftp, local_path, remote_path, client)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
sftp = client.open_sftp()

# Step 1: Upload Expo assets (fonts, images from dist/assets/)
print("=== [1] Uploading Expo web assets (fonts, images) ===")
local_assets = r"E:\barber-shop-app\dist\assets"
run(client, f"mkdir -p {BARBER_DIR}/assets")
upload_dir(sftp, local_assets, f"{BARBER_DIR}/assets", client)

# Step 2: Upload rebuilt admin panel
print("\n=== [2] Uploading rebuilt admin panel ===")
run(client, f"rm -rf {BARBER_DIR}/super_admin")
run(client, f"mkdir -p {BARBER_DIR}/super_admin/assets")
upload_dir(sftp, r"E:\barber-shop-app\admin-dist", f"{BARBER_DIR}/super_admin", client)

# Step 3: Verify
print("\n=== [3] Verification ===")
run(client, f"ls -la {BARBER_DIR}/assets/ | head -10")
run(client, f"ls -la {BARBER_DIR}/super_admin/")

# Check a font file URL
print("\nAsset tests:")
# Find a font file
out, _ = run(client, f"find {BARBER_DIR}/assets -name '*.ttf' | head -3", show=False)
if out.strip():
    for font_path in out.strip().split('\n')[:2]:
        relative = font_path.replace(f"/home/{USER}/domains/barmagly.tech/public_html", "")
        url = f"https://barmagly.tech{relative}"
        status, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
        print(f"  Font {relative}: {status.strip()}")

# Test admin panel
admin_status, _ = run(client, "curl -s -o /dev/null -w '%{http_code}' 'https://barmagly.tech/barber/super_admin/' 2>&1", show=False)
print(f"  Admin panel: {admin_status.strip()}")

# Check admin panel HTML has correct basename
admin_js, _ = run(client, f"ls {BARBER_DIR}/super_admin/assets/*.js", show=False)
print(f"  Admin JS file: {admin_js.strip()}")

sftp.close()
client.close()

print("\n=== DONE ===")
