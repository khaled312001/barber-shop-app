#!/usr/bin/env python3
"""Deploy barber-shop-app to barber.barmagly.tech via SSH"""
import paramiko
import os
import sys
import stat

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

LOCAL_BASE = os.path.dirname(os.path.abspath(__file__))

def ssh_connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    return client

def run_cmd(client, cmd, show=True):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:2000])
    if err and 'warning' not in err.lower():
        print(f"STDERR: {err[:500]}")
    return out, err

def upload_dir(sftp, local_dir, remote_dir):
    """Recursively upload a directory"""
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        sftp.mkdir(remote_dir)

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"

        if os.path.isfile(local_path):
            file_size = os.path.getsize(local_path)
            if file_size > 50 * 1024 * 1024:  # Skip files > 50MB
                print(f"  SKIP (too large): {item}")
                continue
            print(f"  Upload: {item} ({file_size//1024}KB)")
            sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            if item in ['node_modules', '.git', '.expo', '__pycache__']:
                continue
            print(f"  Dir: {item}/")
            upload_dir(sftp, local_path, remote_path)

def main():
    print("=== Barber Shop Deployment ===")
    print(f"Target: {USER}@{HOST}:{PORT}")

    # Connect
    print("\n[1/7] Connecting via SSH...")
    client = ssh_connect()
    sftp = client.open_sftp()
    print("Connected!")

    # Find subdomain root
    print("\n[2/7] Finding subdomain root...")
    out, _ = run_cmd(client, "ls -la ~/domains/ 2>/dev/null; echo '---'; ls ~/")

    # Check common Hostinger paths
    for path in [
        f"/home/{USER}/domains/barber.barmagly.tech/public_html",
        f"/home/{USER}/public_html/barber.barmagly.tech",
        f"/home/{USER}/public_html",
    ]:
        out, _ = run_cmd(client, f"test -d {path} && echo EXISTS || echo NO", show=False)
        if "EXISTS" in out:
            webroot = path
            print(f"Webroot found: {webroot}")
            break
    else:
        # Try to find it
        out, _ = run_cmd(client, f"find /home/{USER} -name 'public_html' -type d 2>/dev/null | head -10")
        print(f"Searching... found: {out}")
        # Default to common Hostinger path
        webroot = f"/home/{USER}/domains/barber.barmagly.tech/public_html"
        run_cmd(client, f"mkdir -p {webroot}")
        print(f"Created webroot: {webroot}")

    app_dir = f"/home/{USER}/barber-app"

    # Create app directory
    print("\n[3/7] Creating app directory...")
    run_cmd(client, f"mkdir -p {app_dir}/server_dist {app_dir}/admin-dist {app_dir}/static-build {app_dir}/public/uploads {app_dir}/shared {app_dir}/server")

    # Upload server bundle
    print("\n[4/7] Uploading server bundle...")
    server_dist = os.path.join(LOCAL_BASE, "server_dist", "index.js")
    if os.path.exists(server_dist):
        sftp.put(server_dist, f"{app_dir}/server_dist/index.js")
        print(f"  server_dist/index.js ({os.path.getsize(server_dist)//1024}KB)")

    # Upload admin-dist
    print("\n[4b/7] Uploading admin panel...")
    admin_dist = os.path.join(LOCAL_BASE, "admin-dist")
    if os.path.exists(admin_dist):
        upload_dir(sftp, admin_dist, f"{app_dir}/admin-dist")

    # Upload static-build (Expo web)
    print("\n[4c/7] Uploading Expo web build...")
    static_build = os.path.join(LOCAL_BASE, "static-build")
    if os.path.exists(static_build):
        upload_dir(sftp, static_build, f"{app_dir}/static-build")

    # Upload package.json for production deps
    print("\n[4d/7] Uploading package.json...")
    sftp.put(os.path.join(LOCAL_BASE, "package.json"), f"{app_dir}/package.json")

    # Upload server templates
    templates_dir = os.path.join(LOCAL_BASE, "server", "templates")
    if os.path.exists(templates_dir):
        run_cmd(client, f"mkdir -p {app_dir}/server/templates")
        for f in os.listdir(templates_dir):
            sftp.put(os.path.join(templates_dir, f), f"{app_dir}/server/templates/{f}")
            print(f"  server/templates/{f}")

    # Upload drizzle files for migrations
    print("\n[4e/7] Uploading schema and drizzle config...")
    sftp.put(os.path.join(LOCAL_BASE, "shared", "schema.ts"), f"{app_dir}/shared/schema.ts")
    sftp.put(os.path.join(LOCAL_BASE, "drizzle.config.ts"), f"{app_dir}/drizzle.config.ts")

    # Upload seed script
    sftp.put(os.path.join(LOCAL_BASE, "server", "seed.ts"), f"{app_dir}/server/seed.ts")

    # Upload app.json for getAppName()
    app_json = os.path.join(LOCAL_BASE, "app.json")
    if os.path.exists(app_json):
        sftp.put(app_json, f"{app_dir}/app.json")

    # Create .env
    print("\n[5/7] Creating .env...")
    env_content = """DB_HOST=localhost
DB_USER=u492425110_barber
DB_PASSWORD=K68$~Tf6=
DB_NAME=u492425110_barber
SESSION_SECRET=barmagly_session_secret_2026_secure_key
NODE_ENV=production
PORT=3000
"""
    # Write env via command to avoid special char issues
    run_cmd(client, f"""cat > {app_dir}/.env << 'ENVEOF'
{env_content}
ENVEOF""", show=False)
    print("  .env created")

    # Install production dependencies
    print("\n[6/7] Installing production dependencies on server...")
    out, err = run_cmd(client, f"cd {app_dir} && which node && node --version && which npm && npm --version")
    out, err = run_cmd(client, f"cd {app_dir} && npm install --production --no-optional 2>&1 | tail -20")

    # Create .htaccess for reverse proxy (Hostinger uses Apache)
    print("\n[7/7] Setting up reverse proxy...")
    htaccess = """RewriteEngine On

# Proxy all requests to Node.js app on port 3000
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# If proxy fails, try direct file serving
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
"""
    run_cmd(client, f"""cat > {webroot}/.htaccess << 'HTEOF'
{htaccess}
HTEOF""", show=False)
    print("  .htaccess created at webroot")

    # Also symlink/copy key files to webroot for direct access
    run_cmd(client, f"ln -sf {app_dir}/static-build/* {webroot}/ 2>/dev/null")

    # Try to start the app
    print("\n[STARTING] Starting Node.js app...")
    # Kill any existing node process
    run_cmd(client, "pkill -f 'node.*server_dist' 2>/dev/null", show=False)

    # Start with nohup
    run_cmd(client, f"cd {app_dir} && nohup node server_dist/index.js > app.log 2>&1 &", show=False)

    import time
    time.sleep(3)

    # Check if running
    out, _ = run_cmd(client, "ps aux | grep 'server_dist' | grep -v grep")
    if 'node' in out:
        print("Node.js app is running!")
    else:
        print("Checking logs...")
        out, _ = run_cmd(client, f"cat {app_dir}/app.log | tail -30")

    # Check health
    out, _ = run_cmd(client, "curl -s http://127.0.0.1:3000/health 2>&1")
    print(f"Health check: {out}")

    print("\n=== Deployment Complete ===")
    print(f"App directory: {app_dir}")
    print(f"Webroot: {webroot}")
    print(f"\nURLs:")
    print(f"  Main App: https://barber.barmagly.tech/")
    print(f"  Admin Panel: https://barber.barmagly.tech/super_admin")
    print(f"  API: https://barber.barmagly.tech/api/")
    print(f"  Health: https://barber.barmagly.tech/health")

    sftp.close()
    client.close()

if __name__ == "__main__":
    main()
