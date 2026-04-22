const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // WAMP default
  database: 'address_book_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err);
    return;
  }
  console.log('✅ MySQL Connected (via Pool)');
  connection.release();
});

module.exports = pool;