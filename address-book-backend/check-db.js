const db = require('./config/db');

db.query('SELECT company_id, COUNT(*) as count FROM customers GROUP BY company_id', (err, results) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Customer counts per company:');
  console.table(results);
  
  db.query('SELECT * FROM companies', (err, comps) => {
      if (err) console.error(err);
      console.log('Companies:');
      console.table(comps);
      process.exit(0);
  });
});
