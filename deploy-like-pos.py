#!/usr/bin/env python3
"""Deploy barber app same way as POS - using mod_proxy on barmagly.tech"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"
DOMAIN_ROOT = f"/home/{USER}/domains/barmagly.tech"
PUBLIC_HTML = f"{DOMAIN_ROOT}/public_html"

def run(client, cmd, show=True, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    if show and err and 'grep' not in cmd:
        print(f"ERR: {err[:1000]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Step 1: Check current POS setup
print("=== [1] Checking current POS setup ===")
run(client, f"ls -la {DOMAIN_ROOT}/")
run(client, f"ls -la {DOMAIN_ROOT}/pos-nodejs/ | head -20")
print("\nCurrent .htaccess:")
run(client, f"cat {PUBLIC_HTML}/.htaccess")

# Step 2: Check what port POS runs on and what port we should use
print("\n=== [2] Checking running Node processes ===")
run(client, "ps aux | grep node | grep -v grep")

# Step 3: Ensure barber app runs on port 3000 (POS is on 5001)
print("\n=== [3] Ensuring barber app is running on port 3000 ===")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1", show=False)
if '"ok"' in out:
    print("Barber app already running on port 3000")
else:
    print("Starting barber app...")
    run(client, "pkill -f 'node.*barber-app/server_dist' 2>/dev/null", show=False)
    time.sleep(1)
    client.exec_command(f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &")
    time.sleep(5)
    out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1")
    print(f"Health: {out}")

# Step 4: Add proxy rules to .htaccess for barber routes
print("\n=== [4] Adding barber proxy rules to .htaccess ===")

# Read current htaccess
out, _ = run(client, f"cat {PUBLIC_HTML}/.htaccess", show=False)
current_htaccess = out

# Check if barber proxy already added
if 'barber-api' in current_htaccess or '3000/barber' in current_htaccess:
    print("Barber proxy rules already exist in .htaccess")
else:
    # Add barber proxy rules before the closing </IfModule>
    barber_proxy_rules = """
    # ============================================
    # Barber Shop App (port 3000)
    # ============================================
    ProxyPass /barber-api http://127.0.0.1:3000/api
    ProxyPassReverse /barber-api http://127.0.0.1:3000/api

    ProxyPass /barber-health http://127.0.0.1:3000/health
    ProxyPassReverse /barber-health http://127.0.0.1:3000/health

    ProxyPass /barber-uploads http://127.0.0.1:3000/uploads
    ProxyPassReverse /barber-uploads http://127.0.0.1:3000/uploads

    ProxyPass /barber-auth http://127.0.0.1:3000/api/auth
    ProxyPassReverse /barber-auth http://127.0.0.1:3000/api/auth

    ProxyPass /salon http://127.0.0.1:3000/salon
    ProxyPassReverse /salon http://127.0.0.1:3000/salon
"""
    new_htaccess = current_htaccess.replace('</IfModule>', barber_proxy_rules + '\n</IfModule>')

    # Write back
    sftp = client.open_sftp()
    with sftp.open(f"{PUBLIC_HTML}/.htaccess", 'w') as f:
        f.write(new_htaccess)
    sftp.close()
    print("Barber proxy rules added to .htaccess")

# Step 5: Copy barber static files to public_html/barber/
print("\n=== [5] Copying barber frontend to public_html/barber/ ===")
run(client, f"""
rm -rf {PUBLIC_HTML}/barber/*
mkdir -p {PUBLIC_HTML}/barber
cp -r {APP_DIR}/static-build/* {PUBLIC_HTML}/barber/ 2>/dev/null
""")

# Create barber admin panel
run(client, f"""
mkdir -p {PUBLIC_HTML}/barber/super_admin
cp -r {APP_DIR}/admin-dist/* {PUBLIC_HTML}/barber/super_admin/ 2>/dev/null
""")

# Copy uploads
run(client, f"""
mkdir -p {PUBLIC_HTML}/barber/uploads
cp -r {APP_DIR}/public/uploads/* {PUBLIC_HTML}/barber/uploads/ 2>/dev/null
""")

print("\nBarber directory contents:")
run(client, f"ls -la {PUBLIC_HTML}/barber/")

# Step 6: Create a barber index.php that proxies everything
print("\n=== [6] Creating barber/index.php proxy ===")
sftp = client.open_sftp()

barber_index_php = """<?php
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove /barber prefix for Node.js
$nodePath = preg_replace('#^/barber#', '', $uri);
if (empty($nodePath)) $nodePath = '/';

// Proxy to Node.js backend on port 3000
$nodeUrl = "http://127.0.0.1:3000" . $nodePath;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $nodeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Forward request headers
$reqHeaders = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'host' && $lower !== 'connection') {
        $reqHeaders[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);

// Forward body
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Forward cookies
if (!empty($_SERVER['HTTP_COOKIE'])) {
    curl_setopt($ch, CURLOPT_COOKIE, $_SERVER['HTTP_COOKIE']);
}

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false || $error) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Backend unavailable"]);
    exit;
}

$headerStr = substr($response, 0, $header_size);
$body = substr($response, $header_size);

foreach (explode("\\r\\n", $headerStr) as $line) {
    $line = trim($line);
    if (empty($line)) continue;
    $lower = strtolower($line);
    if (strpos($lower, 'transfer-encoding') === 0) continue;
    if (strpos($lower, 'connection:') === 0) continue;
    if (strpos($lower, 'http/') === 0) continue;
    header($line, strpos($lower, 'set-cookie') === 0 ? false : true);
}

http_response_code($httpcode);
echo $body;
"""
with sftp.open(f"{PUBLIC_HTML}/barber/index.php", 'w') as f:
    f.write(barber_index_php)

# .htaccess for barber subfolder
barber_htaccess = """DirectoryIndex index.html index.php

RewriteEngine On

# Serve existing static files directly
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# super_admin SPA
RewriteCond %{REQUEST_URI} ^/barber/super_admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /barber/super_admin/index.html [L]

# API/backend routes -> PHP proxy
RewriteCond %{REQUEST_URI} ^/barber/api [OR]
RewriteCond %{REQUEST_URI} ^/barber/health [OR]
RewriteCond %{REQUEST_URI} ^/barber/salon/
RewriteRule ^(.*)$ index.php [QSA,L]

# SPA fallback for Expo web
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
"""
with sftp.open(f"{PUBLIC_HTML}/barber/.htaccess", 'w') as f:
    f.write(barber_htaccess)

sftp.close()
print("index.php proxy and .htaccess created")

# Step 7: Verify
print("\n=== [7] Verification ===")

# Internal
print("Internal checks:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health")
print(f"  Port 3000 /health: {out.strip()}")

out, _ = run(client, "curl -s http://127.0.0.1:3000/api/salons 2>&1 | head -c 100")
print(f"  Port 3000 /api/salons: {out[:100]}")

# External
print("\nExternal checks:")
urls = [
    'https://barmagly.tech/barber/',
    'https://barmagly.tech/barber/health',
    'https://barmagly.tech/barber/api/salons',
    'https://barmagly.tech/barber/super_admin/',
    'https://barmagly.tech/barber-health',
    'https://barmagly.tech/barber-api/salons',
]
for url in urls:
    out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
    body, _ = run(client, f"curl -s '{url}' 2>&1 | head -c 150", show=False)
    print(f"  {url}")
    print(f"    Status: {out.strip()} | Body: {body[:150]}")

client.close()

print("\n=== DEPLOYMENT URLS ===")
print("Main App:    https://barmagly.tech/barber/")
print("Admin Panel: https://barmagly.tech/barber/super_admin/")
print("API:         https://barmagly.tech/barber-api/salons")
print("Health:      https://barmagly.tech/barber-health")
