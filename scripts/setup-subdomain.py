"""Set up barber.barmagly.tech subdomain with PHP proxy and deploy all files."""
import paramiko
import os
import time

HOST, PORT, USER, PASS = "82.198.227.175", 65002, "u492425110", "support@Passord123"
REMOTE_BASE = "/home/u492425110/barber-app"
REMOTE_PUBLIC = "/home/u492425110/domains/barber.barmagly.tech/public_html"

def sftp_mkdir_p(sftp, d):
    dirs = []
    while d and d != "/":
        try:
            sftp.stat(d)
            break
        except FileNotFoundError:
            dirs.append(d)
            d = os.path.dirname(d)
    for x in reversed(dirs):
        try:
            sftp.mkdir(x)
        except:
            pass

def upload_dir(sftp, local, remote, label):
    count = 0
    for root, _, files in os.walk(local):
        rel = os.path.relpath(root, local).replace(os.sep, "/")
        rpath = remote if rel == "." else f"{remote}/{rel}"
        sftp_mkdir_p(sftp, rpath)
        for f in files:
            sftp.put(os.path.join(root, f), f"{rpath}/{f}")
            count += 1
    print(f"  [{label}] Uploaded {count} files")

def upload_file(sftp, local_path, remote_path):
    sftp_mkdir_p(sftp, os.path.dirname(remote_path))
    sftp.put(local_path, remote_path)
    print(f"  Uploaded {os.path.basename(local_path)}")

def run(ssh, cmd, label=""):
    if label:
        print(f"  [{label}] {cmd[:80]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60)
    out = stdout.read().decode()
    err = stderr.read().decode()
    return out, err

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    print("=" * 60)
    print("SETTING UP barber.barmagly.tech")
    print("=" * 60)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()

    # 1. Create .htaccess for subdomain
    print("\n[1/6] Creating .htaccess for subdomain...")
    htaccess_content = """DirectoryIndex index.html index.php

RewriteEngine On

# Serve existing static files directly (JS, CSS, images, fonts)
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Serve existing directories
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# super_admin SPA - serve admin index.html for all sub-routes
RewriteCond %{REQUEST_URI} ^/super_admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^super_admin/(.*)$ /super_admin/index.html [L]

# API and auth routes -> PHP proxy to Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ index.php [L,QSA]

# Expo web SPA fallback - all other routes serve index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
"""
    htaccess_path = os.path.join(base, ".htaccess.subdomain")
    with open(htaccess_path, "w") as f:
        f.write(htaccess_content)
    upload_file(sftp, htaccess_path, f"{REMOTE_PUBLIC}/.htaccess")
    os.remove(htaccess_path)

    # 2. Create PHP proxy for API
    print("\n[2/6] Creating PHP proxy...")
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

// Forward request headers
$reqHeaders = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'host' && $lower !== 'connection') {
        $reqHeaders[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);

// Forward body for POST/PUT/PATCH/DELETE
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
    echo json_encode(["error" => "Backend unavailable", "detail" => $error]);
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
    php_path = os.path.join(base, "index.php.subdomain")
    with open(php_path, "w") as f:
        f.write(php_proxy)
    upload_file(sftp, php_path, f"{REMOTE_PUBLIC}/index.php")
    os.remove(php_path)

    # 3. Upload Expo web build
    print("\n[3/6] Uploading Expo web build...")
    upload_dir(sftp, "dist", REMOTE_PUBLIC, "expo-web")

    # 4. Upload admin panel to super_admin path
    print("\n[4/6] Uploading admin panel...")
    upload_dir(sftp, "admin-dist", f"{REMOTE_PUBLIC}/super_admin", "admin")

    # 5. Upload server bundle
    print("\n[5/6] Uploading server bundle...")
    sftp_mkdir_p(sftp, f"{REMOTE_BASE}/server_dist")
    upload_file(sftp, "server_dist/index.js", f"{REMOTE_BASE}/server_dist/index.js")
    upload_file(sftp, "server_dist/seed.js", f"{REMOTE_BASE}/server_dist/seed.js")

    # 6. Restart server
    print("\n[6/6] Restarting server...")
    run(ssh, 'pkill -f "node server_dist/index.js" || true', "kill")
    time.sleep(2)
    run(ssh, f'cd {REMOTE_BASE} && bash -c "nohup node server_dist/index.js > server.log 2>&1 & disown; echo started"', "start")
    time.sleep(3)

    out, _ = run(ssh, 'pgrep -f "node server_dist/index.js"')
    pids = out.strip().splitlines()
    print(f"  Server PID(s): {pids}")

    out, _ = run(ssh, 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/salons')
    print(f"  API health: {out.strip()}")

    out, _ = run(ssh, f'ls -la {REMOTE_PUBLIC}/index.html {REMOTE_PUBLIC}/super_admin/index.html 2>&1')
    print(f"  Files: {out.strip()}")

    sftp.close()
    ssh.close()

    print("\n" + "=" * 60)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print(f"\n  Main App:    https://barber.barmagly.tech/")
    print(f"  Onboarding:  https://barber.barmagly.tech/onboarding")
    print(f"  Admin Panel: https://barber.barmagly.tech/super_admin")
    print(f"  Admin Login: https://barber.barmagly.tech/super_admin/login")
    print(f"  API:         https://barber.barmagly.tech/api/salons")
    print(f"\n  Login: superadmin@casca.com / 123456")
    print()

if __name__ == "__main__":
    main()
