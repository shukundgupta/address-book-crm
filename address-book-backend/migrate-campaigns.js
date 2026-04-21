const db = require('./config/db');

const tables = [
  `CREATE TABLE IF NOT EXISTS email_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_body LONGTEXT NOT NULL,
    filter_type VARCHAR(50) DEFAULT 'all',
    filter_value VARCHAR(255) DEFAULT NULL,
    total_recipients INT DEFAULT 0,
    total_batches INT DEFAULT 0,
    current_batch INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS campaign_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) DEFAULT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT DEFAULT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_campaign_email (campaign_id, recipient_email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

(async () => {
  for (const sql of tables) {
    await new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (err) {
          console.error('❌ Migration failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Table created/verified');
          resolve(result);
        }
      });
    });
  }
  console.log('✅ All campaign tables ready!');
  process.exit(0);
})();
