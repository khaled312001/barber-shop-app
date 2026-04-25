"""Fix and redeploy: admin panel paths + htaccess for static files."""
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

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()

    # 1. Fix .htaccess - the key issue is that _expo files need to be served
    #    directly by Apache, not routed through PHP or SPA fallback.
    #    On Hostinger, RewriteCond %{REQUEST_FILENAME} -f may not work if
    #    the DocumentRoot mapping is off. Let's be explicit.
    print("[1/4] Uploading fixed .htaccess...")
    htaccess = """DirectoryIndex index.html index.php

RewriteEngine On

# CRITICAL: Serve existing static files directly (JS, CSS, images, fonts, etc.)
# This must come FIRST before any other rules
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -l
RewriteRule ^ - [L]

# Serve existing directories with trailing slash
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# super_admin SPA - serve admin index.html for all sub-routes
# (but only if no static file matched above)
RewriteRule ^super_admin/assets/(.*)$ super_admin/assets/$1 [L]
RewriteRule ^super_admin$ super_admin/index.html [L]
RewriteRule ^super_admin/(.*)$ super_admin/index.html [L]

# API routes -> PHP proxy to Node.js
RewriteRule ^api/(.*)$ index.php [L,QSA]

# Expo web SPA fallback - all remaining non-file routes
RewriteRule ^ index.html [L]
"""
    htaccess_path = os.path.join(base, "_tmp_htaccess")
    with open(htaccess_path, "w", newline="\n") as f:
        f.write(htaccess)
    sftp.put(htaccess_path, f"{REMOTE_PUBLIC}/.htaccess")
    os.remove(htaccess_path)
    print("  Done")

    # 2. Upload fixed admin panel (with /super_admin/ base path)
    print("[2/4] Uploading fixed admin panel...")
    upload_dir(sftp, "admin-dist", f"{REMOTE_PUBLIC}/super_admin", "admin")

    # 3. Upload Expo web (ensure correct index.html)
    print("[3/4] Uploading Expo web...")
    upload_dir(sftp, "dist", REMOTE_PUBLIC, "expo-web")

    # 4. Verify
    print("[4/4] Verifying...")
    stdin, stdout, stderr = ssh.exec_command(f"cat {REMOTE_PUBLIC}/super_admin/index.html", timeout=10)
    print("  Admin index.html:")
    print("  " + stdout.read().decode().strip()[:300])

    stdin, stdout, stderr = ssh.exec_command(f"head -1 {REMOTE_PUBLIC}/index.html && grep 'entry-' {REMOTE_PUBLIC}/index.html", timeout=10)
    html = stdout.read().decode().strip()
    print(f"\n  Expo index.html entry: {html}")

    stdin, stdout, stderr = ssh.exec_command(f"ls {REMOTE_PUBLIC}/_expo/static/js/web/entry-*.js", timeout=10)
    print(f"  Expo JS file on disk: {stdout.read().decode().strip()}")

    sftp.close()
    ssh.close()
    print("\nDone!")

if __name__ == "__main__":
    main()
