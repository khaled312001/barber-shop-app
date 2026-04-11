#!/usr/bin/env python3
"""Check server environment for Node.js"""
import paramiko

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

def run(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out.strip(), err.strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Check various node paths
checks = [
    "which node",
    "which nodejs",
    "find /opt -name 'node' -type f 2>/dev/null | head -5",
    "find /usr/local -name 'node' -type f 2>/dev/null | head -5",
    "ls -la /opt/alt/*/bin/node 2>/dev/null",
    "ls /opt/cpanel/ea-nodejs*/bin/ 2>/dev/null",
    "ls ~/.nvm/versions/node/ 2>/dev/null",
    "cat /etc/hostinger 2>/dev/null || cat /etc/redhat-release 2>/dev/null || cat /etc/os-release 2>/dev/null | head -5",
    "ls ~/nodevenv/ 2>/dev/null",
    "ls /opt/ 2>/dev/null",
    "php -v 2>/dev/null | head -1",
    "ls /home/u492425110/.nvm 2>/dev/null",
    # Check if we can install NVM
    "curl --version 2>/dev/null | head -1",
    "wget --version 2>/dev/null | head -1",
    # Check Hostinger hPanel Node.js
    "ls /opt/alt/alt-nodejs*/root/usr/bin/node 2>/dev/null",
    "find / -name 'node' -type f 2>/dev/null | head -10",
]

for cmd in checks:
    out, err = run(client, cmd)
    print(f"$ {cmd}")
    if out:
        print(f"  => {out}")
    if err and 'which:' not in err and 'No such' not in err and 'Permission denied' not in err:
        print(f"  ERR: {err}")
    print()

client.close()
