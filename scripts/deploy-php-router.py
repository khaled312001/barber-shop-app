"""Deploy PHP router + updated .htaccess to fix static file serving on barber.barmagly.tech."""
import paramiko
import os
import time

HOST, PORT, USER, PASS = "82.198.227.175", 65002, "u492425110", "support@Passord123"
REMOTE_PUBLIC = "/home/u492425110/domains/barber.barmagly.tech/public_html"

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to server...")
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()

    # 1. Upload the PHP router as index.php
    print("[1/4] Uploading PHP router as index.php...")
    sftp.put("subdomain-index.php", f"{REMOTE_PUBLIC}/index.php")
    print("  Done")

    # 2. Upload new .htaccess that routes EVERYTHING through index.php
    #    Since LiteSpeed's -f check doesn't work for _expo/ files,
    #    we route ALL requests through PHP which does its own file checks.
    print("[2/4] Uploading .htaccess...")
    htaccess_content = """# Route ALL requests through PHP router
# LiteSpeed doesn't reliably serve _expo/ static files, so PHP handles it
RewriteEngine On

# Don't rewrite the PHP router itself (prevents infinite loop)
RewriteRule ^index\\.php$ - [L]

# Send everything else to the PHP router
RewriteRule ^ index.php [L,QSA]
"""
    htaccess_path = os.path.join(base, "_tmp_htaccess_sub")
    with open(htaccess_path, "w", newline="\n") as f:
        f.write(htaccess_content)
    sftp.put(htaccess_path, f"{REMOTE_PUBLIC}/.htaccess")
    os.remove(htaccess_path)
    print("  Done")

    # 3. Verify files are in place
    print("[3/4] Verifying deployed files...")
    stdin, stdout, stderr = ssh.exec_command(f"head -5 {REMOTE_PUBLIC}/index.php", timeout=10)
    php_head = stdout.read().decode().strip()
    print(f"  index.php starts with: {php_head[:100]}")

    stdin, stdout, stderr = ssh.exec_command(f"cat {REMOTE_PUBLIC}/.htaccess", timeout=10)
    htaccess_out = stdout.read().decode().strip()
    print(f"  .htaccess:\n  {htaccess_out[:300]}")

    # Check that _expo JS files exist on disk
    stdin, stdout, stderr = ssh.exec_command(f"ls -la {REMOTE_PUBLIC}/_expo/static/js/web/entry-*.js 2>&1 | head -3", timeout=10)
    expo_files = stdout.read().decode().strip()
    print(f"  Expo JS files: {expo_files}")

    # Check admin assets exist
    stdin, stdout, stderr = ssh.exec_command(f"ls -la {REMOTE_PUBLIC}/super_admin/assets/ 2>&1 | head -5", timeout=10)
    admin_files = stdout.read().decode().strip()
    print(f"  Admin assets: {admin_files}")

    # 4. Test with curl
    print("\n[4/4] Testing endpoints via curl...")

    # Test main page
    stdin, stdout, stderr = ssh.exec_command(
        'curl -sI -H "Host: barber.barmagly.tech" http://127.0.0.1/index.php 2>&1 | head -5',
        timeout=15
    )
    print(f"  Main page: {stdout.read().decode().strip()}")

    # Test if _expo JS files can be served through PHP router
    # First get the actual filename
    stdin, stdout, stderr = ssh.exec_command(
        f"ls {REMOTE_PUBLIC}/_expo/static/js/web/entry-*.js 2>&1 | head -1",
        timeout=10
    )
    entry_file = stdout.read().decode().strip()
    if entry_file and "No such" not in entry_file:
        entry_basename = os.path.basename(entry_file)
        # Test via the PHP router
        stdin, stdout, stderr = ssh.exec_command(
            f'curl -sI "https://barber.barmagly.tech/_expo/static/js/web/{entry_basename}" 2>&1 | head -10',
            timeout=15
        )
        result = stdout.read().decode().strip()
        print(f"  Expo JS ({entry_basename[:30]}...):\n  {result}")

    # Test admin panel
    stdin, stdout, stderr = ssh.exec_command(
        'curl -sI "https://barber.barmagly.tech/super_admin/" 2>&1 | head -5',
        timeout=15
    )
    print(f"  Admin panel: {stdout.read().decode().strip()}")

    # Test API
    stdin, stdout, stderr = ssh.exec_command(
        'curl -s "https://barber.barmagly.tech/api/salons" 2>&1 | head -c 200',
        timeout=15
    )
    print(f"  API /api/salons: {stdout.read().decode().strip()[:200]}")

    sftp.close()
    ssh.close()
    print("\nDone! Check https://barber.barmagly.tech/")

if __name__ == "__main__":
    main()
