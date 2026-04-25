"""Quick deploy: upload Expo web + restart server."""
import paramiko
import os
import time

HOST, PORT, USER, PASS = "82.198.227.175", 65002, "u492425110", "support@Passord123"
REMOTE_PUBLIC = "/home/u492425110/domains/barmagly.tech/public_html/barber"
REMOTE_BASE = "/home/u492425110/barber-app"

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
    print(f"[{label}] Uploaded {count} files")

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()

    print("Uploading Expo web build...")
    upload_dir(sftp, "dist", REMOTE_PUBLIC, "expo-web")

    print("Restarting server...")
    ssh.exec_command('pkill -f "node server_dist/index.js" || true', timeout=15)
    time.sleep(1)
    cmd = f'cd {REMOTE_BASE} && bash -c "nohup node server_dist/index.js > server.log 2>&1 & disown; echo started"'
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=15)
    print(stdout.read().decode().strip())

    time.sleep(2)
    stdin, stdout, stderr = ssh.exec_command('pgrep -f "node server_dist/index.js" || echo NOT_RUNNING', timeout=10)
    print(f"Server PID: {stdout.read().decode().strip()}")

    sftp.close()
    ssh.close()
    print("Deploy complete!")

if __name__ == "__main__":
    main()
