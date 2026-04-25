"""
Fix barber.barmagly.tech by deploying non-prefixed build to the MAIN domain's /barber/ directory.
The subdomain actually points to public_html/barber/ (like POS points to public_html/pos/).
"""
import paramiko
import os
import time

HOST, PORT, USER, PASS = "82.198.227.175", 65002, "u492425110", "support@Passord123"
REMOTE_BARBER = "/home/u492425110/domains/barmagly.tech/public_html/barber"
REMOTE_PUBLIC = "/home/u492425110/domains/barmagly.tech/public_html"

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
    print("Connecting to server...")
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()

    # 1. Deploy non-prefixed Expo web build to public_html/barber/
    print("\n[1/5] Deploying Expo web (non-prefixed) to /barber/...")
    # First remove old _expo directory to avoid stale files
    stdin, stdout, stderr = ssh.exec_command(f"rm -rf {REMOTE_BARBER}/_expo", timeout=30)
    stdout.read()
    upload_dir(sftp, "dist", REMOTE_BARBER, "expo-web")

    # 2. Deploy admin panel to /barber/super_admin/
    print("\n[2/5] Deploying admin panel to /barber/super_admin/...")
    stdin, stdout, stderr = ssh.exec_command(f"rm -rf {REMOTE_BARBER}/super_admin/assets", timeout=15)
    stdout.read()
    upload_dir(sftp, "admin-dist", f"{REMOTE_BARBER}/super_admin", "admin")

    # 3. Upload .htaccess for /barber/ (handles both subdomain and subpath)
    print("\n[3/5] Uploading .htaccess...")
    htaccess = """DirectoryIndex index.html index.php

RewriteEngine On

# Serve existing static files directly
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Serve existing directories
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# super_admin SPA - all sub-routes serve admin index.html
RewriteRule ^super_admin/assets/(.*)$ super_admin/assets/$1 [L]
RewriteRule ^super_admin$ super_admin/index.html [L]
RewriteRule ^super_admin/(.*)$ super_admin/index.html [L]

# API routes -> PHP proxy to Node.js on port 3000
RewriteRule ^api/(.*)$ index.php [L,QSA]

# Health check
RewriteRule ^health$ index.php [L,QSA]

# SPA fallback - everything else serves index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
"""
    tmp_path = os.path.join(base, "_tmp_htaccess_barber")
    with open(tmp_path, "w", newline="\n") as f:
        f.write(htaccess)
    sftp.put(tmp_path, f"{REMOTE_BARBER}/.htaccess")
    os.remove(tmp_path)
    print("  Done")

    # 4. Upload PHP proxy (index.php) for API routes
    print("\n[4/5] Uploading index.php API proxy...")
    sftp.put("subdomain-index.php", f"{REMOTE_BARBER}/index.php")
    print("  Done")

    # 5. Create symlinks at public_html root so both paths work:
    #    barber.barmagly.tech/_expo/... -> public_html/barber/_expo/...
    #    barmagly.tech/barber/_expo/... -> same files (already in /barber/)
    #    barmagly.tech/_expo/... -> symlink to /barber/_expo/ (for non-prefixed refs)
    print("\n[5/5] Creating root-level symlinks for cross-path compatibility...")
    symlinks = [
        (f"{REMOTE_BARBER}/_expo", f"{REMOTE_PUBLIC}/_expo"),
        (f"{REMOTE_BARBER}/assets", f"{REMOTE_PUBLIC}/assets"),
    ]
    for target, link_name in symlinks:
        # Remove existing if it's a symlink or file (not dir)
        stdin, stdout, stderr = ssh.exec_command(
            f"rm -f {link_name} 2>/dev/null; ln -sf {target} {link_name} 2>&1",
            timeout=10
        )
        result = stdout.read().decode().strip()
        if result:
            print(f"  Symlink {link_name}: {result}")
        else:
            print(f"  Symlink {link_name} -> {target}: OK")

    # Verify
    print("\n=== Verification ===")
    checks = [
        ("index.html", f"head -3 {REMOTE_BARBER}/index.html && echo '---' && grep 'entry-' {REMOTE_BARBER}/index.html"),
        ("JS file", f"ls -la {REMOTE_BARBER}/_expo/static/js/web/entry-*.js 2>&1 | head -1"),
        ("Admin", f"head -3 {REMOTE_BARBER}/super_admin/index.html"),
        (".htaccess", f"head -5 {REMOTE_BARBER}/.htaccess"),
        ("Symlinks", f"ls -la {REMOTE_PUBLIC}/_expo {REMOTE_PUBLIC}/assets 2>&1"),
        ("index.php", f"head -3 {REMOTE_BARBER}/index.php"),
    ]
    for label, cmd in checks:
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=10)
        out = stdout.read().decode().strip()
        print(f"\n  [{label}]: {out[:200]}")

    # Now purge cache for the changed content
    print("\n=== Purging LiteSpeed cache ===")
    purge_paths = ["/", "/*", "/index.html",
                   "/_expo/static/js/web/entry-720efacf925d04755168d2c69021534a.js",
                   "/super_admin/", "/api/salons"]
    for p in purge_paths:
        stdin, stdout, stderr = ssh.exec_command(
            f'curl -sI -X PURGE "https://barber.barmagly.tech{p}" 2>&1 | head -1',
            timeout=10
        )
        print(f"  PURGE {p}: {stdout.read().decode().strip()}")

    time.sleep(3)

    # Test the actual responses
    print("\n=== Testing responses ===")
    tests = [
        ("Subdomain /", 'curl -sI "https://barber.barmagly.tech/" 2>&1 | head -15'),
        ("Subdomain JS", 'curl -sI "https://barber.barmagly.tech/_expo/static/js/web/entry-720efacf925d04755168d2c69021534a.js" 2>&1 | head -10'),
        ("Subdomain admin", 'curl -sI "https://barber.barmagly.tech/super_admin/" 2>&1 | head -10'),
        ("Subdomain API", 'curl -s "https://barber.barmagly.tech/api/salons" 2>&1 | head -c 150'),
        ("Main domain barber", 'curl -sI "https://barmagly.tech/barber/" 2>&1 | head -10'),
    ]
    for label, cmd in tests:
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=15)
        print(f"\n  [{label}]:")
        print(f"  {stdout.read().decode().strip()[:300]}")

    sftp.close()
    ssh.close()
    print("\n\nDone!")

if __name__ == "__main__":
    main()
