const nodemailer = require('nodemailer');
const db = require('../config/db');

/**
 * Gets a transporter and sender email for a specific company.
 * Falls back to environment variables if company settings are missing.
 */
async function getTransporter(companyId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT sender_email, smtp_user, smtp_pass FROM companies WHERE id = ?';
    db.query(sql, [companyId], (err, results) => {
      if (err) {
        console.error('❌ Error fetching company email config:', err);
        return reject(err);
      }

      const config = results[0];
      const user = config?.smtp_user || process.env.EMAIL_USER || 'shukundgupta@gmail.com';
      const pass = config?.smtp_pass || process.env.EMAIL_PASS || 'alaoyudjoktzcwrk';
      const from = config?.sender_email || process.env.EMAIL_USER || 'shukundgupta@gmail.com';

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

      resolve({ transporter, fromEmail: from });
    });
  });
}

module.exports = { getTransporter };
