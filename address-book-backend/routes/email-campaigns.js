const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

/* ==============================
   AUTH (ALL ROUTES PROTECTED)
================================ */
router.use(auth);

/* ==============================
   EMAIL TRANSPORTER
================================ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shukundgupta@gmail.com',
    pass: 'alaoyudjoktzcwrk'
  }
});

/* ==============================
   HELPER: Build final email HTML with template
================================ */
function buildEmailHtml(templateHeader, htmlBody, templateFooter, templateColor) {
  const accentColor = templateColor || '#1e3a5f';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; }
    .email-wrapper { max-width:794px; margin:0 auto; background:#ffffff; }
    .email-header { 
      background:${accentColor}; 
      padding:0; 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact;
    }
    .email-body { padding:30px 40px; font-size:14px; color:#333; line-height:1.7; }
    .email-footer { 
      background:${accentColor}; 
      padding:0; 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact;
    }
    table { border-collapse:collapse; width:100%; }
    td, th { border:1px solid #ccc; padding:8px; }
    img { max-width:100%; height:auto; }
    a { color:${accentColor}; }
    h1,h2,h3 { color:${accentColor}; }
    ul, ol { padding-left:20px; }
    li { margin-bottom:4px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">${templateHeader || ''}</div>
    <div class="email-body">${htmlBody}</div>
    <div class="email-footer">${templateFooter || ''}</div>
  </div>
</body>
</html>
  `;
}

/* ==============================
   HELPER: Send one email to one recipient (individual)
================================ */
async function sendOneEmail(recipient, subject, fullHtml, fromName, campaignId) {
  try {
    // Personalise content with recipient variables
    let personalised = fullHtml
      .replace(/{{company_name}}/g, recipient.company_name || '')
      .replace(/{{contact_person}}/g, recipient.contact_person || recipient.company_name || '')
      .replace(/{{city}}/g, recipient.city || '')
      .replace(/{{state}}/g, recipient.state || '');

    await transporter.sendMail({
      from: `"${fromName}" <shukundgupta@gmail.com>`,
      to: recipient.email,
      subject: subject,
      html: personalised
    });

    db.query(
      `INSERT INTO campaign_logs (campaign_id, recipient_email, recipient_name, status, sent_at)
       VALUES (?, ?, ?, 'sent', NOW())
       ON DUPLICATE KEY UPDATE status='sent', sent_at=NOW()`,
      [campaignId, recipient.email, recipient.company_name || '']
    );
    return { success: true };

  } catch (err) {
    db.query(
      `INSERT INTO campaign_logs (campaign_id, recipient_email, recipient_name, status, error_message, sent_at)
       VALUES (?, ?, ?, 'failed', ?, NOW())
       ON DUPLICATE KEY UPDATE status='failed', error_message=?, sent_at=NOW()`,
      [campaignId, recipient.email, recipient.company_name || '', err.message, err.message]
    );
    return { success: false, error: err.message };
  }
}

/* ==============================
   HELPER: Sleep
================================ */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ==============================
   GET CAMPAIGN STATS (filter preview)
================================ */
router.post('/preview', (req, res) => {
  console.log('🔍 Preview Request Body:', JSON.stringify(req.body, null, 2));
  const company_id = req.user.company_id;
  const { filter_type, filter_value, customer_type } = req.body;

  let sql = `SELECT id, email, company_name, city, state, pincode FROM customers WHERE company_id = ? AND email IS NOT NULL AND email != ''`;
  let params = [company_id];

  if (customer_type && customer_type !== 'All') {
    sql += ` AND customer_type = ?`;
    params.push(customer_type);
  }

  if (filter_type === 'state' && filter_value) {
    sql += ` AND state = ?`;
    params.push(filter_value);
  } else if (filter_type === 'city' && filter_value) {
    sql += ` AND city = ?`;
    params.push(filter_value);
  } else if (filter_type === 'pincode' && filter_value) {
    sql += ` AND pincode = ?`;
    params.push(filter_value);
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ Preview DB Error:', err);
      return res.status(500).json({ message: 'DB error', error: err.message });
    }

    const totalRecipients = rows.length;
    console.log(`🔍 Preview: Found ${totalRecipients} recipients for company ${company_id}`);
    const delaySeconds = 3; 
    const estimatedSeconds = totalRecipients * delaySeconds;
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

    res.json({
      total: totalRecipients,
      batches: totalRecipients, // one per recipient
      estimatedMinutes,
      sample: rows.slice(0, 5),
      recipients: rows // Return all recipients for the front-end list window
    });
  });

});

/* ==============================
   GET DISTINCT STATES / CITIES / PINCODES
================================ */
router.get('/filter-options', (req, res) => {

  const company_id = req.user.company_id;

  const statesSql = `SELECT DISTINCT state FROM customers WHERE company_id = ? AND state IS NOT NULL AND state != '' ORDER BY state`;
  const citiesSql = `SELECT DISTINCT city FROM customers WHERE company_id = ? AND city IS NOT NULL AND city != '' ORDER BY city`;
  const pincodesSql = `SELECT DISTINCT pincode FROM customers WHERE company_id = ? AND pincode IS NOT NULL AND pincode != '' ORDER BY pincode`;

  db.query(statesSql, [company_id], (err, states) => {
    if (err) return res.status(500).json({ message: 'DB error' });

    db.query(citiesSql, [company_id], (err, cities) => {
      if (err) return res.status(500).json({ message: 'DB error' });

      db.query(pincodesSql, [company_id], (err, pincodes) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        res.json({
          states: states.map(r => r.state),
          cities: cities.map(r => r.city),
          pincodes: pincodes.map(r => r.pincode)
        });
      });
    });
  });

});

/* ==============================
   SAVE DRAFT (Create or Update)
================================ */
router.post('/save', (req, res) => {
  console.log('📬 Save Request Body:', JSON.stringify(req.body, null, 2));

  const company_id = req.user.company_id;
  const {
    id,
    campaign_name,
    subject,
    html_body,
    filter_type,
    filter_value,
    customer_type,
    template_header,
    template_footer,
    template_color,
    from_name,
    social_fb,
    social_ig,
    social_li,
    social_tw
  } = req.body;

  const c_name   = campaign_name || 'Untitled Campaign';
  const c_subject = subject || '';
  const c_body    = html_body || '';
  const c_f_type  = filter_type || 'all';
  const c_f_val   = filter_value || null;
  const c_c_type  = customer_type || 'Existing';
  const c_header  = template_header || '';
  const c_footer  = template_footer || '';
  const c_color   = template_color || '#1e3a5f';
  const c_from    = from_name || '';
  const c_fb      = social_fb || '';
  const c_ig      = social_ig || '';
  const c_li      = social_li || '';
  const c_tw      = social_tw || '';

  console.log(`📝 Save Draft: ID=${id}, Company=${company_id}, Name="${c_name}", From="${c_from}"`);

  if (id) {
    const sql = `
      UPDATE email_campaigns SET
        campaign_name = ?, subject = ?, html_body = ?, filter_type = ?, filter_value = ?,
        customer_type = ?, from_name = ?, social_fb = ?, social_ig = ?, social_li = ?, social_tw = ?,
        template_header = ?, template_footer = ?, template_color = ?,
        status = 'draft'
      WHERE id = ? AND company_id = ?
    `;
    const params = [c_name, c_subject, c_body, c_f_type, c_f_val, c_c_type, c_from, c_fb, c_ig, c_li, c_tw, c_header, c_footer, c_color, id, company_id];
    console.log('📝 Executing UPDATE Query...');
    
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('❌ Draft UPDATE Error:', err);
        return res.status(500).json({ 
          message: 'Update failed: ' + (err.sqlMessage || err.message), 
          error: err.code || 'DB_ERROR' 
        });
      }
      console.log('✅ Draft Updated! ID:', id);
      res.json({ message: 'Draft updated successfully', id });
    });
  } else {
    const sql = `
      INSERT INTO email_campaigns
        (company_id, campaign_name, subject, html_body, filter_type, filter_value, customer_type, from_name, social_fb, social_ig, social_li, social_tw, template_header, template_footer, template_color, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `;
    const params = [company_id, c_name, c_subject, c_body, c_f_type, c_f_val, c_c_type, c_from, c_fb, c_ig, c_li, c_tw, c_header, c_footer, c_color];
    console.log('📝 Executing INSERT Query...');

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('❌ Draft INSERT Error:', err);
        return res.status(500).json({ 
          message: 'Insert failed: ' + (err.sqlMessage || err.message), 
          error: err.code || 'DB_ERROR' 
        });
      }
      console.log('✅ Draft Saved! ID:', result.insertId);
      res.json({ message: 'Draft saved successfully', id: result.insertId });
    });
  }
});

/* ==============================
   SEND CAMPAIGN (Individual: 1 email per recipient, 3s delay)
================================ */
router.post('/send', async (req, res) => {

  const company_id = req.user.company_id;
  const {
    id, // optional: if sending from a previously saved draft
    campaign_name,
    subject,
    html_body,
    filter_type,
    filter_value,
    customer_type,
    from_name,
    template_header,
    template_footer,
    template_color,
    social_fb,
    social_ig,
    social_li,
    social_tw
  } = req.body;

  if (!subject || !html_body || !campaign_name) {
    return res.status(400).json({ message: 'Campaign name, subject and body are required' });
  }

  // Fetch recipients
  let sqlRecip = `SELECT id, email, company_name, contact_person, city, state, pincode FROM customers WHERE company_id = ? AND email IS NOT NULL AND email != ''`;
  let paramsRecip = [company_id];

  if (customer_type && customer_type !== 'All') {
    sqlRecip += ` AND customer_type = ?`;
    paramsRecip.push(customer_type);
  }

  if (filter_type === 'state' && filter_value) {
    sqlRecip += ` AND state = ?`;
    paramsRecip.push(filter_value);
  } else if (filter_type === 'city' && filter_value) {
    sqlRecip += ` AND city = ?`;
    paramsRecip.push(filter_value);
  } else if (filter_type === 'pincode' && filter_value) {
    sqlRecip += ` AND pincode = ?`;
    paramsRecip.push(filter_value);
  }

  db.query(sqlRecip, paramsRecip, async (err, recipients) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch recipients' });

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No customers with email found for this filter' });
    }

    const totalRecipients = recipients.length;
    const DELAY_MS = 3000;
    const estimatedMinutes = Math.ceil((totalRecipients * DELAY_MS) / 60000);

    const fullHtml = buildEmailHtml(template_header, html_body, template_footer, template_color);

    if (id) {
      // UPDATE EXISTING CAMPAIGN TO 'sending'
      const updateSql = `
        UPDATE email_campaigns SET
          campaign_name = ?, subject = ?, html_body = ?, filter_type = ?, filter_value = ?,
          customer_type = ?, from_name = ?, social_fb = ?, social_ig = ?, social_li = ?, social_tw = ?,
          template_header = ?, template_footer = ?, template_color = ?,
          total_recipients = ?, total_batches = ?, status = 'sending', created_at = NOW()
        WHERE id = ? AND company_id = ?
      `;
      db.query(updateSql, [
        campaign_name, subject, fullHtml, filter_type || 'all', filter_value || null,
        customer_type || 'Existing', from_name, social_fb || '', social_ig || '', social_li || '', social_tw || '',
        template_header, template_footer, template_color,
        totalRecipients, totalRecipients, id, company_id
      ], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update campaign status' });
        startBackgroundSending(id, recipients, subject, fullHtml, from_name, totalRecipients, DELAY_MS, estimatedMinutes, res);
      });
    } else {
      // CREATE NEW CAMPAIGN RECORD
      const campaignSql = `
        INSERT INTO email_campaigns
          (company_id, campaign_name, subject, html_body, filter_type, filter_value, customer_type, from_name, social_fb, social_ig, social_li, social_tw, template_header, template_footer, template_color, total_recipients, total_batches, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sending', NOW())
      `;
      db.query(campaignSql, [
        company_id, campaign_name, subject, fullHtml, filter_type || 'all', filter_value || null,
        customer_type || 'Existing', from_name, social_fb || '', social_ig || '', social_li || '', social_tw || '',
        template_header, template_footer, template_color,
        totalRecipients, totalRecipients
      ], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to create campaign' });
        startBackgroundSending(result.insertId, recipients, subject, fullHtml, from_name, totalRecipients, DELAY_MS, estimatedMinutes, res);
      });
    }
  });

});

/**
 * Helper to handle background sending logic
 */
function startBackgroundSending(campaignId, recipients, subject, fullHtml, fromName, totalRecipients, DELAY_MS, estimatedMinutes, res) {
  // Respond immediately
  res.json({
    message: 'Campaign started! Sending one email at a time.',
    campaignId,
    totalRecipients,
    totalBatches: totalRecipients,
    estimatedMinutes
  });

  (async () => {
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        db.query(
          `UPDATE email_campaigns SET current_batch = ?, sent_count = ?, failed_count = ? WHERE id = ?`,
          [i + 1, totalSent, totalFailed, campaignId]
        );

        const result = await sendOneEmail(
          recipient, subject, fullHtml,
          fromName || 'AddressBook CRM',
          campaignId
        );

        if (result.success) totalSent++;
        else totalFailed++;

        if (i < recipients.length - 1) await sleep(DELAY_MS);
    }

    db.query(
      `UPDATE email_campaigns SET status = 'completed', sent_count = ?, failed_count = ?, completed_at = NOW() WHERE id = ?`,
      [totalSent, totalFailed, campaignId]
    );
  })();
}

/* ==============================
   GET CAMPAIGN HISTORY
================================ */
router.get('/history', (req, res) => {

  const company_id = req.user.company_id;

  const sql = `
    SELECT id, campaign_name, subject, filter_type, filter_value, customer_type, 
           total_recipients, sent_count, failed_count, status, created_at, from_name
    FROM email_campaigns
    WHERE company_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `;

  db.query(sql, [company_id], (err, rows) => {
    if (err) {
      console.error('❌ History DB Error:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    console.log(`📋 History: Loaded ${rows.length} campaigns for company ${company_id}`);
    res.json(rows);
  });

});

/* ==============================
   GET CAMPAIGN DETAIL (logs)
================================ */
router.get('/history/:id', (req, res) => {

  const company_id = req.user.company_id;
  const campaignId = req.params.id;

  const campaignSql = `SELECT * FROM email_campaigns WHERE id = ? AND company_id = ?`;

  db.query(campaignSql, [campaignId, company_id], (err, campaign) => {
    if (err || !campaign.length) return res.status(404).json({ message: 'Campaign not found' });

    const logsSql = `SELECT * FROM campaign_logs WHERE campaign_id = ? ORDER BY sent_at DESC`;
    db.query(logsSql, [campaignId], (err, logs) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      console.log(`🔍 Detail: Loaded campaign #${campaignId} for company ${company_id}`);
      res.json({ campaign: campaign[0], logs });
    });
  });

});

/* ==============================
   DELETE CAMPAIGN
================================ */
router.delete('/history/:id', (req, res) => {

  const company_id = req.user.company_id;
  const campaignId = req.params.id;

  db.query(`DELETE FROM campaign_logs WHERE campaign_id = ?`, [campaignId], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete logs' });

    db.query(`DELETE FROM email_campaigns WHERE id = ? AND company_id = ?`, [campaignId, company_id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to delete campaign' });
      res.json({ message: 'Campaign deleted successfully' });
    });
  });

});

module.exports = router;
