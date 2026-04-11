#!/usr/bin/env python3
"""Deploy - Phase 8: Configure PHP routing and proper .htaccess"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"
WEBROOT = f"/home/{USER}/domains/barber.barmagly.tech/public_html"

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
sftp = client.open_sftp()

# First, clean the webroot and set up properly
print("[1] Setting up webroot with PHP proxy...")

# Remove symlinks and old files
run(client, f"""
rm -f {WEBROOT}/index.html {WEBROOT}/favicon.ico {WEBROOT}/metadata.json {WEBROOT}/app.js
rm -f {WEBROOT}/node_modules {WEBROOT}/server
rm -rf {WEBROOT}/_expo {WEBROOT}/assets
""", show=False)

# Create proper .htaccess
htaccess = """DirectoryIndex index.php

RewriteEngine On

# Serve existing files directly (CSS, JS, images)
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Serve existing directories
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Route everything else through PHP proxy
RewriteRule ^(.*)$ index.php [QSA,L]
"""
with sftp.open(f"{WEBROOT}/.htaccess", 'w') as f:
    f.write(htaccess)
print("  .htaccess created")

# Create the PHP proxy/router
php_content = """<?php
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Static files for admin panel
if (strpos($uri, '/super_admin') === 0) {
    $file = __DIR__ . '/super_admin/index.html';
    if (file_exists($file)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($file);
        exit;
    }
}

// Proxy to Node.js backend
$nodeUrl = "http://127.0.0.1:3000" . $uri;

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

// Forward body for POST/PUT/PATCH
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
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
    // Node.js not reachable - serve static Expo web app
    $staticFile = __DIR__ . '/static' . $uri;
    if (file_exists($staticFile) && !is_dir($staticFile)) {
        $ext = pathinfo($staticFile, PATHINFO_EXTENSION);
        $mimes = ['html'=>'text/html','js'=>'application/javascript','css'=>'text/css','json'=>'application/json','png'=>'image/png','jpg'=>'image/jpeg','svg'=>'image/svg+xml','ico'=>'image/x-icon'];
        if (isset($mimes[$ext])) header("Content-Type: " . $mimes[$ext]);
        readfile($staticFile);
        exit;
    }
    // Serve index.html for SPA fallback
    $index = __DIR__ . '/static/index.html';
    if (file_exists($index)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($index);
        exit;
    }
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Backend temporarily unavailable", "detail" => $error]);
    exit;
}

// Parse response headers and body
$headerStr = substr($response, 0, $header_size);
$body = substr($response, $header_size);

// Forward response headers
$headerLines = explode("\\r\\n", $headerStr);
foreach ($headerLines as $line) {
    $line = trim($line);
    if (empty($line)) continue;
    $lower = strtolower($line);
    // Skip certain headers
    if (strpos($lower, 'transfer-encoding') === 0) continue;
    if (strpos($lower, 'connection:') === 0) continue;
    if (strpos($lower, 'http/') === 0) continue;
    header($line, strpos($lower, 'set-cookie') === 0 ? false : true);
}

http_response_code($httpcode);
echo $body;
"""
with sftp.open(f"{WEBROOT}/index.php", 'w') as f:
    f.write(php_content)
print("  index.php proxy created")

# Copy static files (not symlinks — actual copies)
print("\n[2] Copying static files to webroot...")
run(client, f"""
mkdir -p {WEBROOT}/static
cp -r {APP_DIR}/static-build/* {WEBROOT}/static/ 2>/dev/null
mkdir -p {WEBROOT}/super_admin
cp -r {APP_DIR}/admin-dist/* {WEBROOT}/super_admin/ 2>/dev/null
mkdir -p {WEBROOT}/uploads
cp -r {APP_DIR}/public/uploads/* {WEBROOT}/uploads/ 2>/dev/null
""")

# List webroot
print("\n[3] Webroot contents:")
out, _ = run(client, f"ls -la {WEBROOT}/")

# Ensure Node.js is running
print("\n[4] Ensuring Node.js is running on port 3000...")
out, _ = run(client, "ps aux | grep 'server_dist' | grep -v grep", show=False)
if 'node' not in out:
    print("Starting Node.js...")
    client.exec_command(f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &")
    time.sleep(4)
else:
    print("Already running")

# Internal check
out, _ = run(client, "curl -s http://127.0.0.1:3000/health")
print(f"Internal: {out}")

# External checks
print("\n[5] External URL checks:")
for path in ['/health', '/api/salons', '/', '/super_admin']:
    out, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' https://barber.barmagly.tech{path} 2>&1", show=False)
    print(f"  {path} => {out.strip()}")

# Get actual response for /health
out, _ = run(client, "curl -s https://barber.barmagly.tech/health 2>&1 | head -c 200", show=False)
print(f"\n  /health body: {out[:200]}")

# Get actual response for /api/salons
out, _ = run(client, "curl -s https://barber.barmagly.tech/api/salons 2>&1 | head -c 300", show=False)
print(f"  /api/salons body: {out[:300]}")

sftp.close()
client.close()
