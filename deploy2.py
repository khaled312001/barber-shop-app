#!/usr/bin/env python3
"""Deploy barber-shop-app - Phase 2: Setup Node.js, install deps, start app"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"

def run(client, cmd, show=True, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:3000])
    if show and err and 'warn' not in err.lower():
        print(f"ERR: {err[:1000]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Check node version
print("=== Phase 2: Setup & Start ===")
print("\n[1] Checking Node.js...")
out, _ = run(client, f"{NODE_BIN}/node --version")
out, _ = run(client, f"ls {NODE_BIN}/npm {NODE_BIN}/npx 2>/dev/null")

# Add node to PATH in .bashrc
print("\n[2] Setting up PATH...")
run(client, f"""
grep -q 'alt-nodejs22' ~/.bashrc || echo 'export PATH={NODE_BIN}:$PATH' >> ~/.bashrc
""", show=False)

# Create a proper startup script
print("\n[3] Creating startup script...")
startup_script = f"""#!/bin/bash
export PATH={NODE_BIN}:$PATH
export NODE_ENV=production
cd {APP_DIR}

# Source env
set -a
source .env
set +a

# Start the app
exec node server_dist/index.js
"""

run(client, f"""cat > {APP_DIR}/start.sh << 'SCRIPTEOF'
{startup_script}
SCRIPTEOF
chmod +x {APP_DIR}/start.sh""", show=False)

# Install production dependencies using the correct node/npm
print("\n[4] Installing npm dependencies...")
out, err = run(client, f"export PATH={NODE_BIN}:$PATH && cd {APP_DIR} && npm install --production --no-optional 2>&1 | tail -20", timeout=180)

# Kill any old process
print("\n[5] Stopping any old process...")
run(client, f"pkill -f 'node.*server_dist' 2>/dev/null; sleep 1", show=False)

# Start the app
print("\n[6] Starting the app...")
run(client, f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &", show=False)

time.sleep(4)

# Check if running
print("\n[7] Checking if app is running...")
out, _ = run(client, "ps aux | grep 'server_dist' | grep -v grep")

# Check logs
print("\n[8] App logs:")
out, _ = run(client, f"cat {APP_DIR}/app.log | tail -30")

# Health check
print("\n[9] Health check...")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1")
print(f"Result: {out}")

# Check if webroot .htaccess is working
print("\n[10] Checking webroot setup...")
webroot = f"/home/{USER}/domains/barber.barmagly.tech/public_html"
out, _ = run(client, f"test -d {webroot} && echo 'EXISTS' || echo 'MISSING'")

# If the subdomain directory doesn't exist under domains, we need to check Hostinger's setup
if "MISSING" in out:
    print("Subdomain webroot doesn't exist yet. Checking alternative paths...")
    out, _ = run(client, f"find /home/{USER}/domains -type d -name 'public_html' 2>/dev/null")
    # On Hostinger, subdomains are typically set up via hPanel
    # Let's try the main domain path with a subdomain folder
    webroot = f"/home/{USER}/domains/barmagly.tech/public_html/barber"
    run(client, f"mkdir -p {webroot}")
    print(f"Using webroot: {webroot}")

# Setup proper .htaccess at the webroot
htaccess_content = """DirectoryIndex disabled

RewriteEngine On

# Proxy API requests to Node.js
RewriteCond %{REQUEST_URI} ^/api/ [OR]
RewriteCond %{REQUEST_URI} ^/health [OR]
RewriteCond %{REQUEST_URI} ^/super_admin [OR]
RewriteCond %{REQUEST_URI} ^/uploads/ [OR]
RewriteCond %{REQUEST_URI} ^/salon/
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# Serve static files directly if they exist
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Otherwise proxy to Node
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
"""
run(client, f"""cat > {webroot}/.htaccess << 'HTEOF'
{htaccess_content}
HTEOF""", show=False)
print(f".htaccess written to {webroot}")

# Also copy the static files to webroot for direct serving
print("\nCopying static files to webroot...")
run(client, f"cp -r {APP_DIR}/static-build/* {webroot}/ 2>/dev/null", show=False)
run(client, f"mkdir -p {webroot}/super_admin && cp -r {APP_DIR}/admin-dist/* {webroot}/super_admin/ 2>/dev/null", show=False)

print("\n=== Deployment Summary ===")
print(f"App dir: {APP_DIR}")
print(f"Webroot: {webroot}")
print(f"Node: {NODE_BIN}/node")
print(f"\nURLs:")
print(f"  https://barber.barmagly.tech/")
print(f"  https://barber.barmagly.tech/super_admin")
print(f"  https://barber.barmagly.tech/api/")
print(f"  https://barber.barmagly.tech/health")

client.close()
