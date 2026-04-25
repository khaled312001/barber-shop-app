"""Add superadmin@casca.com user to database."""
import paramiko

HOST, PORT, USER, PASS = "82.198.227.175", 65002, "u492425110", "support@Passord123"
DB_USER, DB_PASS, DB_NAME = "u492425110_barber", "K68$~Tf6=", "u492425110_barber"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode()
    err = stderr.read().decode()
    return out, err

# 1. Check existing admins
out, err = run(f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} -e \"SELECT id, full_name, email, role FROM users WHERE role IN ('admin','super_admin');\"")
print("Current admins:", out)

# 2. Get bcrypt hash of '123456'
out, err = run("cd /home/u492425110/barber-app && node -e \"const b=require('bcryptjs'); b.hash('123456',10).then(h=>{console.log(h)})\"")
hash_val = out.strip()
print("Hash:", hash_val)

# 3. Insert superadmin@casca.com
sql = f"INSERT INTO users (id, full_name, email, password, role, phone) VALUES ('sa-casca-001', 'Super Admin', 'superadmin@casca.com', '{hash_val}', 'super_admin', '+41 44 000 0000') ON DUPLICATE KEY UPDATE password=VALUES(password), role='super_admin';"
out, err = run(f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} -e \"{sql}\"")
print("Insert result:", out, err)

# 4. Also make existing admin super_admin
out, err = run(f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} -e \"UPDATE users SET role='super_admin' WHERE email='admin@barber.com';\"")
print("Update existing:", out)

# 5. Verify
out, err = run(f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} -e \"SELECT id, full_name, email, role FROM users WHERE role='super_admin';\"")
print("Super admins now:", out)

ssh.close()
print("Done!")
