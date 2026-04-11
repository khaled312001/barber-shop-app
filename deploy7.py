#!/usr/bin/env python3
"""Deploy - Phase 7: Setup Hostinger Node.js app properly"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"

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

# Check the actual subdomain directory
print("[1] Checking subdomain setup...")
out, _ = run(client, f"ls -la /home/{USER}/domains/")
out, _ = run(client, f"ls -la /home/{USER}/domains/barber.barmagly.tech/ 2>/dev/null || echo 'NO DIR'")
out, _ = run(client, f"ls -la /home/{USER}/domains/barmagly.tech/public_html/")

# Check if Passenger is available (Hostinger uses it for Node.js)
print("\n[2] Checking Passenger/Node.js setup...")
out, _ = run(client, "which passenger-config 2>/dev/null || ls /opt/passenger* 2>/dev/null || ls /opt/cpanel/ea-ruby*/root/usr/sbin/passenger* 2>/dev/null || echo 'No Passenger'")

# Check if there is a nodevenv directory
out, _ = run(client, f"ls -la /home/{USER}/nodevenv/ 2>/dev/null || echo 'No nodevenv'")

# Check Phusion Passenger
out, _ = run(client, "ls /opt/passenger/ 2>/dev/null")

# On Hostinger, Node.js apps are typically set up via hPanel
# The typical setup uses Passenger (via .htaccess)
# Let's set up the app to work with Phusion Passenger

print("\n[3] Setting up Passenger-compatible app...")

# Hostinger with CloudLinux uses Phusion Passenger
# The entry point should be app.js in the webroot
webroot = f"/home/{USER}/domains/barber.barmagly.tech/public_html"

# Check if subdomain exists - if not, try to use the main domain's subfolder
out, _ = run(client, f"test -d /home/{USER}/domains/barber.barmagly.tech && echo YES || echo NO", show=False)
if "NO" in out:
    print("Subdomain directory not found. Creating it...")
    run(client, f"mkdir -p {webroot}")

# Create a Passenger-compatible app.js wrapper
print("\n[4] Creating Passenger app.js...")
app_js = f"""
// Passenger entry point
const {{ execSync }} = require('child_process');
const path = require('path');

// Set environment
process.env.NODE_ENV = 'production';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'u492425110_barber';
process.env.DB_PASSWORD = 'K68$~Tf6=';
process.env.DB_NAME = 'u492425110_barber';
process.env.SESSION_SECRET = 'barmagly_session_secret_2026_secure_key';
process.env.PORT = process.env.PORT || '3000';

// Load the bundled server
require('{APP_DIR}/server_dist/index.js');
"""
sftp = client.open_sftp()
with sftp.open(f"{webroot}/app.js", 'w') as f:
    f.write(app_js)

# Create .htaccess for Passenger
htaccess = """PassengerEnabled On
PassengerAppType node
PassengerStartupFile app.js
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerAppRoot /home/u492425110/domains/barber.barmagly.tech/public_html
"""
with sftp.open(f"{webroot}/.htaccess", 'w') as f:
    f.write(htaccess)

# Also create a simple PHP proxy as fallback
php_proxy = """<?php
// PHP reverse proxy to Node.js
$url = "http://127.0.0.1:3000" . $_SERVER['REQUEST_URI'];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Forward headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Forward body for POST/PUT
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($response === false) {
    // Node.js not running, serve static files
    $file = __DIR__ . '/static' . $_SERVER['REQUEST_URI'];
    if (file_exists($file) && !is_dir($file)) {
        readfile($file);
        exit;
    }
    http_response_code(502);
    echo json_encode(["error" => "Backend not available"]);
    exit;
}

http_response_code($httpcode);
if ($content_type) {
    header("Content-Type: $content_type");
}
echo $response;
"""
with sftp.open(f"{webroot}/index.php", 'w') as f:
    f.write(php_proxy)

sftp.close()

# Copy static files to webroot
print("\n[5] Copying static files...")
run(client, f"cp -r {APP_DIR}/static-build/* {webroot}/ 2>/dev/null")
run(client, f"mkdir -p {webroot}/super_admin && cp -r {APP_DIR}/admin-dist/* {webroot}/super_admin/ 2>/dev/null")
run(client, f"mkdir -p {webroot}/uploads && cp -r {APP_DIR}/public/uploads/* {webroot}/uploads/ 2>/dev/null")

# Create node_modules symlink
run(client, f"ln -sf {APP_DIR}/node_modules {webroot}/node_modules 2>/dev/null")

# Ensure server templates are accessible
run(client, f"ln -sf {APP_DIR}/server {webroot}/server 2>/dev/null")

# List what's in webroot
print("\n[6] Webroot contents:")
out, _ = run(client, f"ls -la {webroot}/")

# Restart the background Node.js process too
print("\n[7] Ensuring Node.js is running...")
run(client, "pkill -f 'node.*server_dist' 2>/dev/null", show=False)
time.sleep(1)
client.exec_command(f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &")
time.sleep(4)

# Verify
out, _ = run(client, "curl -s http://127.0.0.1:3000/health")
print(f"Internal health: {out}")

# External check
print("\n[8] External URL checks:")
out, _ = run(client, "curl -s -o /dev/null -w '%{http_code}' https://barber.barmagly.tech/ 2>&1")
print(f"HTTPS / status: {out}")

out, _ = run(client, "curl -s https://barber.barmagly.tech/health 2>&1 | head -c 200")
print(f"HTTPS /health: {out[:200]}")

out, _ = run(client, "curl -s https://barber.barmagly.tech/api/salons 2>&1 | head -c 300")
print(f"HTTPS /api/salons: {out[:300]}")

client.close()
