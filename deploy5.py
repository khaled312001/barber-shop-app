#!/usr/bin/env python3
"""Deploy barber-shop-app - Phase 5: Create tables via Node.js"""
import paramiko
import time

HOST = "82.198.227.175"
PORT = 65002
USER = "u492425110"
PASS = "support@Passord123"

NODE_BIN = "/opt/alt/alt-nodejs22/root/usr/bin"
APP_DIR = f"/home/{USER}/barber-app"

def run(client, cmd, show=True, timeout=180):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if show and out:
        print(out[:5000])
    if show and err:
        print(f"ERR: {err[:2000]}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Create a Node.js script that creates all tables
print("[1] Creating tables via Node.js...")
create_script = r"""
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'u492425110_barber',
    password: 'K68$~Tf6=',
    database: 'u492425110_barber',
    waitForConnections: true,
    connectionLimit: 5,
  });

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      full_name TEXT NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT DEFAULT NULL,
      avatar TEXT DEFAULT NULL,
      nickname TEXT DEFAULT NULL,
      gender TEXT DEFAULT NULL,
      dob TEXT DEFAULT NULL,
      role TEXT DEFAULT 'user',
      loyalty_points INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS salons (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      address TEXT NOT NULL,
      distance TEXT DEFAULT '0 km',
      rating DOUBLE DEFAULT 0,
      review_count INT DEFAULT 0,
      is_open BOOLEAN DEFAULT true,
      open_hours TEXT DEFAULT '9:00 AM - 9:00 PM',
      phone TEXT DEFAULT NULL,
      about TEXT DEFAULT NULL,
      website TEXT DEFAULT NULL,
      latitude DOUBLE DEFAULT 0,
      longitude DOUBLE DEFAULT 0,
      gallery JSON DEFAULT NULL,
      status TEXT DEFAULT 'active',
      owner_id VARCHAR(255) DEFAULT '',
      landing_enabled BOOLEAN DEFAULT false,
      landing_slug TEXT DEFAULT NULL,
      landing_views INT DEFAULT 0,
      landing_theme TEXT DEFAULT 'dark',
      landing_accent_color TEXT DEFAULT '#F4A460',
      landing_booking_url TEXT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS salon_staff (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS plans (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      price DOUBLE NOT NULL DEFAULT 0,
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      features JSON DEFAULT NULL,
      commission_rate DOUBLE DEFAULT 5,
      max_bookings INT DEFAULT 0,
      max_staff INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      plan_id VARCHAR(255) NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS license_keys (
      id VARCHAR(255) PRIMARY KEY,
      \`key\` VARCHAR(255) NOT NULL UNIQUE,
      salon_id VARCHAR(255) DEFAULT '',
      plan_id VARCHAR(255) DEFAULT '',
      status TEXT NOT NULL DEFAULT 'unused',
      expires_at TEXT DEFAULT NULL,
      max_activations INT DEFAULT 0,
      activation_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS license_activations (
      id VARCHAR(255) PRIMARY KEY,
      license_key_id VARCHAR(255) NOT NULL,
      device_id TEXT NOT NULL,
      email TEXT DEFAULT NULL,
      activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) DEFAULT '',
      user_role TEXT DEFAULT NULL,
      action TEXT NOT NULL,
      entity_type TEXT DEFAULT NULL,
      entity_id VARCHAR(255) DEFAULT '',
      metadata JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS commissions (
      id VARCHAR(255) PRIMARY KEY,
      booking_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) NOT NULL,
      amount DOUBLE NOT NULL DEFAULT 0,
      rate DOUBLE NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      amount DOUBLE NOT NULL,
      category TEXT DEFAULT 'general',
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS shifts (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      staff_id VARCHAR(255) NOT NULL,
      day_of_week INT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      name TEXT NOT NULL,
      price DOUBLE NOT NULL,
      duration TEXT NOT NULL,
      image TEXT DEFAULT NULL,
      category TEXT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS packages (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      name TEXT NOT NULL,
      price DOUBLE NOT NULL,
      original_price DOUBLE NOT NULL,
      services JSON DEFAULT NULL,
      image TEXT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS specialists (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      image TEXT DEFAULT NULL,
      rating DOUBLE DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      user_name TEXT NOT NULL,
      user_image TEXT DEFAULT NULL,
      rating INT NOT NULL,
      comment TEXT DEFAULT NULL,
      date TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) NOT NULL,
      salon_name TEXT NOT NULL,
      salon_image TEXT DEFAULT NULL,
      services_list JSON DEFAULT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      total_price DOUBLE NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      payment_method TEXT DEFAULT NULL,
      specialist_id VARCHAR(255) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) NOT NULL,
      salon_name TEXT NOT NULL,
      salon_image TEXT DEFAULT NULL,
      content TEXT NOT NULL,
      sender TEXT NOT NULL DEFAULT 'salon',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system',
      \`read\` BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(255) PRIMARY KEY,
      code VARCHAR(255) NOT NULL UNIQUE,
      discount DOUBLE NOT NULL,
      type TEXT NOT NULL DEFAULT 'percentage',
      expiry_date TEXT NOT NULL,
      usage_limit INT DEFAULT 0,
      used_count INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS inventory (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      quantity INT DEFAULT 0,
      min_quantity INT DEFAULT 5,
      unit TEXT DEFAULT 'pcs',
      price DOUBLE DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tips (
      id VARCHAR(255) PRIMARY KEY,
      booking_id VARCHAR(255) NOT NULL,
      staff_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) NOT NULL,
      amount DOUBLE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS customer_notes (
      id VARCHAR(255) PRIMARY KEY,
      salon_id VARCHAR(255) NOT NULL,
      customer_id VARCHAR(255) NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      salon_id VARCHAR(255) DEFAULT '',
      points INT NOT NULL,
      type TEXT NOT NULL DEFAULT 'earned',
      description TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
      id VARCHAR(255) PRIMARY KEY,
      \`key\` VARCHAR(255) NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of tables) {
    try {
      await pool.execute(sql);
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\S+)/);
      console.log('Created: ' + (match ? match[1] : 'unknown'));
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

  // Verify
  const [rows] = await pool.execute('SHOW TABLES');
  console.log('\nAll tables:', rows.map(r => Object.values(r)[0]).join(', '));

  await pool.end();
}

main().catch(console.error);
"""

# Write the script
sftp = client.open_sftp()
with sftp.open(f"{APP_DIR}/create_tables.js", 'w') as f:
    f.write(create_script)
sftp.close()
print("Script uploaded.")

# Run it
print("\nRunning create_tables.js...")
out, err = run(client, f"export PATH={NODE_BIN}:$PATH && cd {APP_DIR} && node create_tables.js 2>&1")

# Restart the app
print("\n[2] Restarting app...")
run(client, f"pkill -f 'node.*server_dist' 2>/dev/null; sleep 2", show=False)
run(client, f"cd {APP_DIR} && nohup bash start.sh > app.log 2>&1 &", show=False)
time.sleep(6)

# Check logs
print("\n[3] App logs:")
out, _ = run(client, f"cat {APP_DIR}/app.log")

# Health check
print("\n[4] Health check:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/health 2>&1")
print(f"Result: {out}")

# Salons
print("\n[5] Salons API:")
out, _ = run(client, "curl -s http://127.0.0.1:3000/api/salons 2>&1 | head -c 500")
print(f"Result: {out[:500]}")

client.close()
