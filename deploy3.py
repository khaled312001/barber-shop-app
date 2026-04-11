#!/usr/bin/env python3
"""Deploy barber-shop-app - Phase 3: Fix MySQL connection and restart"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"

def run(client, cmd, show=True, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:3000])
    if show and err and 'warn' not in err.lower():
        print(f"ERR: {err[:500]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Fix .env - use 127.0.0.1 instead of localhost to avoid IPv6
print("[1] Fixing .env with 127.0.0.1...")
env_content = """DB_HOST=127.0.0.1
DB_USER=u492425110_barber
DB_PASSWORD=K68$~Tf6=
DB_NAME=u492425110_barber
SESSION_SECRET=barmagly_session_secret_2026_secure_key
NODE_ENV=production
PORT=3000
"""
run(client, f"""cat > {APP_DIR}/.env << 'ENVEOF'
{env_content}
ENVEOF""", show=False)
print("  .env updated with 127.0.0.1")

# Fix postinstall - remove patch-package from production
print("\n[2] Fixing npm postinstall...")
run(client, f"""export PATH={NODE_BIN}:$PATH && cd {APP_DIR} && node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
delete pkg.scripts.postinstall;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('postinstall removed from package.json');
" """)

# Reinstall deps
print("\n[3] Reinstalling dependencies...")
out, _ = run(client, f"export PATH={NODE_BIN}:$PATH && cd {APP_DIR} && npm install --production --no-optional 2>&1 | tail -10", timeout=180)

# Kill old process
print("\n[4] Restarting app...")
run(client, f"pkill -f 'node.*server_dist' 2>/dev/null; sleep 2", show=False)

# Start
run(client, f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &", show=False)
time.sleep(5)

# Check logs
print("\n[5] App logs:")
out, _ = run(client, f"cat {APP_DIR}/app.log")

# Health check
print("\n[6] Health check:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1")
print(f"Result: {out}")

# Check API
print("\n[7] API check:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/api/salons 2>&1 | head -c 500")
print(f"Result: {out}")

client.close()
