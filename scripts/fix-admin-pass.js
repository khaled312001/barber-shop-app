const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function fix() {
  const hash = bcrypt.hashSync('123456', 10);
  console.log('Generated hash for 123456');

  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'u492425110_barber',
    password: 'K68$~Tf6=',
    database: 'u492425110_barber'
  });

  const [rows] = await conn.execute(
    'SELECT id, email, role FROM users WHERE email = ?',
    ['superadmin@casca.com']
  );

  if (rows.length > 0) {
    console.log('User found:', rows[0].email, 'role:', rows[0].role);
    await conn.execute('UPDATE users SET password = ? WHERE email = ?', [hash, 'superadmin@casca.com']);
    console.log('Password updated');
  } else {
    const id = crypto.randomUUID();
    await conn.execute(
      'INSERT INTO users (id, email, password, first_name, last_name, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, 'superadmin@casca.com', hash, 'Super', 'Admin', 'super_admin', '+41000000000']
    );
    console.log('User created:', id);
  }

  const [check] = await conn.execute(
    'SELECT id, email, role FROM users WHERE email = ?',
    ['superadmin@casca.com']
  );
  console.log('Verified:', JSON.stringify(check[0]));
  await conn.end();
}

fix().catch(e => { console.error(e); process.exit(1); });
