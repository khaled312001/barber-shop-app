#!/usr/bin/env python3
"""Setup barber.barmagly.tech subdomain to serve the barber app"""
import paramiko

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

MAIN_PUBLIC = f"/home/{USER}/domains/barmagly.tech/public_html"
SUB_DIR = f"/home/{USER}/domains/barber.barmagly.tech"
SUB_PUBLIC = f"{SUB_DIR}/public_html"
BARBER_DIR = f"{MAIN_PUBLIC}/barber"

def run(client, cmd, show=True, timeout=30):
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

# Check if subdomain directory exists
print("[1] Checking subdomain directory...")
out, _ = run(client, f"ls -la {SUB_DIR}/ 2>/dev/null || echo 'NOT FOUND'")

if 'NOT FOUND' in out:
    print("Creating subdomain directory...")
    run(client, f"mkdir -p {SUB_PUBLIC}")

# Check what's in the subdomain public_html
print("\n[2] Current subdomain contents:")
run(client, f"ls -la {SUB_PUBLIC}/ 2>/dev/null")

# Check DNS
print("\n[3] DNS check:")
run(client, "host barber.barmagly.tech 2>/dev/null || dig barber.barmagly.tech A +short 2>/dev/null || echo 'DNS lookup failed'")

# Test if the subdomain serves from its own dir or the main domain
print("\n[4] Testing subdomain routing...")
sftp = client.open_sftp()

# Place a test file in the subdomain dir
try:
    with sftp.open(f"{SUB_PUBLIC}/test_sub.php", 'w') as f:
        f.write('<?php echo "SUBDOMAIN_OK"; ?>')
    print("  Test file created in subdomain dir")
except Exception as e:
    print(f"  Error: {e}")

sftp.close()

out, _ = run(client, "curl -s https://barber.barmagly.tech/test_sub.php 2>&1 | head -c 200", show=False)
print(f"  Subdomain test: {out[:200]}")

# Clean test file
run(client, f"rm -f {SUB_PUBLIC}/test_sub.php", show=False)

if 'SUBDOMAIN_OK' in out:
    print("\n  >>> Subdomain IS working from its own directory! <<<")
    print("  Setting up the barber app in the subdomain directory...\n")

    # The subdomain works! Now set up the app files there
    # Option: symlink everything from /barber/ to subdomain public_html
    # Or copy the essential files

    print("[5] Setting up subdomain with barber app files...")

    # Clean and create symlinks to barber directory contents
    run(client, f"""
    rm -rf {SUB_PUBLIC}/*
    rm -rf {SUB_PUBLIC}/.[!.]* 2>/dev/null

    # Symlink all content from barber dir
    ln -sf {BARBER_DIR}/_expo {SUB_PUBLIC}/_expo
    ln -sf {BARBER_DIR}/assets {SUB_PUBLIC}/assets
    ln -sf {BARBER_DIR}/super_admin {SUB_PUBLIC}/super_admin
    ln -sf {BARBER_DIR}/uploads {SUB_PUBLIC}/uploads
    ln -sf {BARBER_DIR}/favicon.ico {SUB_PUBLIC}/favicon.ico
    ln -sf {BARBER_DIR}/metadata.json {SUB_PUBLIC}/metadata.json
    """)

    # Copy index.html (need to modify paths for root-level serving)
    sftp = client.open_sftp()

    # For subdomain, assets are at root / level, not /barber/
    index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Casca</title>
    <style id="expo-reset">
      html, body { height: 100%; }
      body { overflow: hidden; }
      #root { display: flex; height: 100%; flex: 1; }
    </style>
    <link rel="preload" href="/_expo/static/css/native-tabs.module-78b0f59737571f455720970791a36bdd.css" as="style">
    <link rel="stylesheet" href="/_expo/static/css/native-tabs.module-78b0f59737571f455720970791a36bdd.css">
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="/_expo/static/js/web/entry-9e3db32b96092ef16fa8feceb0b4b186.js" defer></script>
  </body>
</html>"""
    with sftp.open(f"{SUB_PUBLIC}/index.html", 'w') as f:
        f.write(index_html)

    # Create PHP proxy for API calls (at root level, not /barber/)
    php_proxy = """<?php
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Proxy to Node.js backend on port 3000
$nodeUrl = "http://127.0.0.1:3000" . $uri;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $nodeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$reqHeaders = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'host' && $lower !== 'connection') {
        $reqHeaders[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);

if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

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
    with sftp.open(f"{SUB_PUBLIC}/index.php", 'w') as f:
        f.write(php_proxy)

    # Create .htaccess for subdomain (root-level, no /barber/ prefix)
    htaccess = """DirectoryIndex index.html index.php

RewriteEngine On

# Serve existing static files directly
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Serve existing directories
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# super_admin SPA
RewriteCond %{REQUEST_URI} ^/super_admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /super_admin/index.html [L]

# API/backend routes -> PHP proxy
RewriteCond %{REQUEST_URI} ^/api [OR]
RewriteCond %{REQUEST_URI} ^/health [OR]
RewriteCond %{REQUEST_URI} ^/salon/
RewriteRule ^(.*)$ index.php [QSA,L]

# SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
"""
    with sftp.open(f"{SUB_PUBLIC}/.htaccess", 'w') as f:
        f.write(htaccess)

    sftp.close()

    print("\n[6] Subdomain file listing:")
    run(client, f"ls -la {SUB_PUBLIC}/")

    print("\n[7] Testing subdomain URLs...")
    for url in ['https://barber.barmagly.tech/', 'https://barber.barmagly.tech/health', 'https://barber.barmagly.tech/api/salons', 'https://barber.barmagly.tech/super_admin/']:
        status, _ = run(client, f"curl -s -o /dev/null -w '%{{http_code}}' '{url}' 2>&1", show=False)
        body, _ = run(client, f"curl -s '{url}' 2>&1 | head -c 150", show=False)
        print(f"  {url}: {status.strip()}")
        if 'api' in url or 'health' in url:
            print(f"    Body: {body[:120]}")

else:
    print("\n  Subdomain does NOT route to its own directory.")
    print("  It needs to be configured in Hostinger hPanel first.")
    print("  Go to: hPanel > Websites > barmagly.tech > Subdomains")
    print("  Create subdomain: barber.barmagly.tech")

client.close()
