#!/usr/bin/env python3
"""Check Apache vhost config and try alternative approaches"""
import paramiko

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

def run(client, cmd, show=True, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Check if the subdomain is registered in Apache
print("[1] Checking Apache config for barber.barmagly.tech...")
run(client, "grep -r 'barber.barmagly' /etc/httpd/conf.d/ 2>/dev/null || echo 'No access or not found'")
run(client, "grep -r 'barber.barmagly' /etc/apache2/ 2>/dev/null || echo 'No access or not found'")

# Check where the main domain serves from
print("\n[2] Main domain structure:")
run(client, f"ls -la /home/{USER}/domains/barmagly.tech/")
run(client, f"ls -la /home/{USER}/domains/barmagly.tech/public_html/")

# Check if barber subdomain config exists
print("\n[3] Does barber subdir have its own vhost?")
run(client, f"ls -la /home/{USER}/conf/")
run(client, f"cat /home/{USER}/conf/httpd.conf 2>/dev/null | head -50 || echo 'No httpd.conf'")

# On Hostinger, subdomains created via hPanel have their document root auto-configured
# If the subdomain was created via hPanel DNS but not hosting, it points to the parent
# Let's check what domain barber.barmagly.tech actually resolves to on Apache

print("\n[4] Checking where requests go...")
# Try via the main domain's public_html with a subdomain subfolder approach
run(client, f"cat /home/{USER}/domains/barmagly.tech/public_html/.htaccess 2>/dev/null")

# Check DNS from the server
print("\n[5] DNS check:")
run(client, "dig barber.barmagly.tech A +short 2>/dev/null || host barber.barmagly.tech 2>/dev/null")

# The subdomain may be serving from the main barmagly.tech public_html
# Let's test by putting a marker file there
print("\n[6] Testing if barber goes to main domain...")
run(client, f"""echo '<?php echo "BARBER_TEST_OK"; ?>' > /home/{USER}/domains/barmagly.tech/public_html/barber_test.php""", show=False)
run(client, "curl -s https://barber.barmagly.tech/barber_test.php 2>&1 | head -c 200")
run(client, f"rm /home/{USER}/domains/barmagly.tech/public_html/barber_test.php", show=False)

# Also test our own webroot
print("\n[7] Testing our webroot...")
run(client, f"""echo '<?php echo "BARBER_WEBROOT_OK"; ?>' > /home/{USER}/domains/barber.barmagly.tech/public_html/test.php""", show=False)
run(client, "curl -s https://barber.barmagly.tech/test.php 2>&1 | head -c 200")

client.close()
