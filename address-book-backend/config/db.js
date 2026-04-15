const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // WAMP default
  database: 'address_book_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err);
    return;
  }
  console.log('✅ MySQL Connected');
});

module.exports = db;