const express = require('express');
const router = express.Router();

const db = require('../config/db');
const auth = require('../middleware/authMiddleware'); // ✅ only one

/* ==============================
   APPLY AUTH (ALL ROUTES PROTECTED)
================================ */
router.use(auth);


/* ==============================
   GET ALL CUSTOMERS
================================ */
router.get('/', (req, res) => {

  const company_id = req.user.company_id;

  const sql = `
    SELECT * FROM customers
    WHERE company_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [company_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching customers' });
    }

    res.json(result);
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
    title
  } = req.body;

  if (contact_number && !/^\d{10}$/.test(contact_number)) {
    return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const query = `
    INSERT INTO customers
    (company_id, title, company_name, customer_type, address, state, city, pincode, email, contact_person, contact_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    contact_number
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
   SEARCH CUSTOMER
================================ */
router.post('/search', (req, res) => {

  const company_id = req.user.company_id;

  const {
    state,
    city,
    pincode,
    customer_type,
    company_name
  } = req.body;

  let sql = `
    SELECT * FROM customers
    WHERE company_id = ?
  `;

  let params = [company_id];

  if (state) {
    sql += " AND state LIKE ?";
    params.push(`%${state}%`);
  }

  if (city) {
    sql += " AND city LIKE ?";
    params.push(`%${city}%`);
  }

  if (pincode) {
    sql += " AND pincode LIKE ?";
    params.push(`%${pincode}%`);
  }

  if (customer_type) {
    sql += " AND customer_type = ?";
    params.push(customer_type);
  }

  if (company_name) {
    sql += " AND company_name LIKE ?";
    params.push(`%${company_name}%`);
  }

  sql += " ORDER BY id DESC";

  db.query(sql, params, (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(result);

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
    title
  } = req.body;

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
      contact_number=?
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