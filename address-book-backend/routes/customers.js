const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

const db = require('../config/db');
const auth = require('../middleware/authMiddleware'); // ✅ only one

/* ==============================
   APPLY AUTH (ALL ROUTES PROTECTED)
================================ */
router.use(auth);


/* ==============================
   EXPORT CUSTOMERS AS CSV
================================ */
router.get('/export', async (req, res) => {

  const company_id = req.user.company_id;

  const sql = `SELECT * FROM customers WHERE company_id = ? ORDER BY id DESC`;

  db.query(sql, [company_id], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Export failed' });
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Customer List');

      // ✅ Set column widths wide enough so nothing is cut off
      sheet.columns = [
        { key: 'A', width: 45 },
        { key: 'B', width: 5  }, // spacer column
        { key: 'C', width: 45 },
      ];

      const buildBlock = (c) => {
        if (!c) return [];
        const addressLines = (c.address || '').split('\n');
        return [
          `Attn. ${c.title || 'Mr.'} ${c.contact_person || ''}`,
          `M/s. ${c.company_name || ''}`,
          ...addressLines,
          `${c.city || ''} ${c.pincode || ''}`,
          `Mobile : ${c.contact_number || ''}`,
          `Email : ${c.email || ''}`
        ];
      };

      for (let i = 0; i < rows.length; i += 2) {
        const b1 = buildBlock(rows[i]);
        const b2 = buildBlock(rows[i + 1]);
        const maxLen = Math.max(b1.length, b2.length);

        for (let j = 0; j < maxLen; j++) {
          const row = sheet.addRow([b1[j] || '', '', b2[j] || '']);

          // Style: left-align, wrap text
          ['A', 'B', 'C'].forEach(col => {
            const cell = row.getCell(col);
            cell.alignment = { horizontal: 'left', wrapText: true };
          });
        }

        // Blank separator row between customer pairs
        sheet.addRow([]);
      }

      // Send as .xlsx
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="Customer_List.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (excelErr) {
      console.error(excelErr);
      res.status(500).json({ message: 'Excel generation failed' });
    }
  });

});


/* ==============================
   GET ALL CUSTOMERS (WITH PAGINATION)
================================ */
router.get('/', (req, res) => {

  const company_id = req.user.company_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countSql = `SELECT COUNT(*) as total FROM customers WHERE company_id = ?`;
  const sql = `
    SELECT * FROM customers
    WHERE company_id = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, [company_id], (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error counting customers' });
    }
    const total = countResult[0].total;

    db.query(sql, [company_id, limit, offset], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching customers' });
      }

      res.json({
        data: result,
        total,
        page,
        limit
      });
    });
  });

});


/* ==============================
   CHECK DUPLICATE COMPANY NAME
================================ */
router.get('/check-duplicate', (req, res) => {

  const company_id = req.user.company_id;
  const name = (req.query.name || '').trim();

  const sql = `
    SELECT COUNT(*) as count
    FROM customers
    WHERE company_id = ? AND company_name = ?
  `;

  db.query(sql, [company_id, name], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json({
      exists: result[0].count > 0
    });

  });

});


/* ==============================
   GET CUSTOMER BY ID
================================ */
router.get('/:id', (req, res) => {

  const id = req.params.id;
  const company_id = req.user.company_id;

  const sql = `SELECT * FROM customers WHERE id = ? AND company_id = ?`;

  db.query(sql, [id, company_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching customer' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(result[0]);
  });

});


/* ==============================
   DASHBOARD STATS
================================ */
router.get('/stats/summary', (req, res) => {

  const company_id = req.user.company_id;

  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN customer_type='New' THEN 1 ELSE 0 END) as new_count,
      SUM(CASE WHEN customer_type='Existing' THEN 1 ELSE 0 END) as existing_count
    FROM customers
    WHERE company_id = ?
  `;

  db.query(query, [company_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(result[0]);
  });

});


/* ==============================
   ADD CUSTOMER
================================ */
router.post('/', (req, res) => {

  const company_id = req.user.company_id;

  const {
    company_name,
    customer_type,
    address,
    state,
    city,
    pincode,
    email,
    contact_person,
    contact_number,
    title,
    tags
  } = req.body;

  if (!company_name || !contact_person || !contact_number) {
    return res.status(400).json({ message: 'Company Name, Contact Person, and Contact Number are required' });
  }

  if (contact_number && !/^\d{10}$/.test(contact_number)) {
    return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const query = `
    INSERT INTO customers
    (company_id, title, company_name, customer_type, address, state, city, pincode, email, contact_person, contact_number, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    company_id,
    title,
    company_name,
    customer_type,
    address,
    state,
    city,
    pincode,
    email,
    contact_person,
    contact_number,
    tags
  ], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Insert failed' });
    }

    res.json({
      message: 'Customer added successfully',
      id: result.insertId
    });

  });

});




/* ==============================
   SEARCH CUSTOMER (WITH PAGINATION)
 ================================ */
router.post('/search', (req, res) => {

  const company_id = req.user.company_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const {
    state,
    city,
    pincode,
    customer_type,
    company_name,
    tags
  } = req.body;

  let baseSql = `WHERE company_id = ?`;
  let params = [company_id];

  if (state) {
    baseSql += " AND state LIKE ?";
    params.push(`%${state}%`);
  }

  if (city) {
    baseSql += " AND city LIKE ?";
    params.push(`%${city}%`);
  }

  if (pincode) {
    baseSql += " AND pincode LIKE ?";
    params.push(`%${pincode}%`);
  }

  if (customer_type) {
    baseSql += " AND customer_type = ?";
    params.push(customer_type);
  }

  if (company_name) {
    baseSql += " AND company_name LIKE ?";
    params.push(`%${company_name}%`);
  }

  if (tags) {
    baseSql += " AND tags LIKE ?";
    params.push(`%${tags}%`);
  }

  const countSql = `SELECT COUNT(*) as total FROM customers ${baseSql}`;
  const sql = `
    SELECT * FROM customers
    ${baseSql}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, params, (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    const total = countResult[0].total;

    db.query(sql, [...params, limit, offset], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json({
        data: result,
        total,
        page,
        limit
      });
    });
  });

});


/* ==============================
   UPDATE CUSTOMER
================================ */
router.put('/:id', (req, res) => {

  const id = req.params.id;
  const company_id = req.user.company_id;

  const {
    company_name,
    customer_type,
    address,
    state,
    city,
    pincode,
    email,
    contact_person,
    contact_number,
    title,
    tags
  } = req.body;

  if (!company_name || !contact_person || !contact_number) {
    return res.status(400).json({ message: 'Company Name, Contact Person, and Contact Number are required' });
  }

  if (contact_number && !/^\d{10}$/.test(contact_number)) {
    return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const sql = `
    UPDATE customers
    SET
      title=?,
      company_name=?,
      customer_type=?,
      address=?,
      state=?,
      city=?,
      pincode=?,
      email=?,
      contact_person=?,
      contact_number=?,
      tags=?
    WHERE id=? AND company_id=?
  `;

  db.query(sql, [
    title,
    company_name,
    customer_type,
    address,
    state,
    city,
    pincode,
    email,
    contact_person,
    contact_number,
    tags,
    id,
    company_id
  ], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({
      message: "Customer updated successfully"
    });

  });

});


/* ==============================
   DELETE CUSTOMER
================================ */
router.delete('/:id', (req, res) => {

  const id = req.params.id;
  const company_id = req.user.company_id;

  const sql = `
    DELETE FROM customers
    WHERE id=? AND company_id=?
  `;

  db.query(sql, [id, company_id], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({
      message: "Customer deleted successfully"
    });

  });

});


module.exports = router;