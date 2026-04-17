const express = require('express');
const router = express.Router();

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

/* ==============================
   EMAIL CONFIG (IMPORTANT)
================================ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shukundgupta@gmail.com',          // 🔁 replace
    pass: 'alaoyudjoktzcwrk'              // 🔁 Gmail App Password
  }
});

/* ==============================
   SEND OTP
================================ */
router.post('/send-otp', (req, res) => {

  const { email, company_id } = req.body;

  if (!email || !company_id) {
    return res.status(400).json({ message: 'Email and Company are required' });
  }

  const checkUserSql = `SELECT id FROM users WHERE email = ? AND company_id = ?`;
  db.query(checkUserSql, [email, company_id], (err, users) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (users.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const sql = `
      INSERT INTO otp_verification (email, otp, expires_at)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [email, otp, expiresAt], (err) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'DB error' });
      }

      /* ==============================
         SEND EMAIL
      ================================= */
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code - AddressBook CRM',
        html: `
          <div style="font-family: Arial; text-align:center;">
            <h2>🔐 OTP Verification</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing:5px;">${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
          console.error('EMAIL ERROR:', error);
          return res.status(500).json({ message: 'Failed to send OTP' });
        }

        console.log('Email sent:', info.response);

        res.json({ message: 'OTP sent successfully' });

      });

    });
  });

});


/* ==============================
   VERIFY OTP
================================ */
router.post('/verify-otp', (req, res) => {

  const { email, otp } = req.body;

  const sql = `
    SELECT * FROM otp_verification 
    WHERE email = ? AND otp = ?
    ORDER BY id DESC LIMIT 1
  `;

  db.query(sql, [email, otp], (err, result) => {

    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const record = result[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    res.json({ message: 'OTP verified' });

  });

});


/* ==============================
   REGISTER
================================ */
router.post('/register', async (req, res) => {

  const { name, email, password, company_id } = req.body;

  if (!name || !email || !password || !company_id) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const checkSql = `
    SELECT * FROM users 
    WHERE email = ? AND company_id = ?
  `;

  db.query(checkSql, [email, company_id], async (err, result) => {

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (name, email, password, company_id)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [name, email, hashedPassword, company_id], (err) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error saving user' });
      }

      res.json({ message: 'Registered successfully' });

    });

  });

});


/* ==============================
   LOGIN
================================ */
router.post('/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email & Password required' });
  }

  const sql = `
    SELECT 
      u.*,
      c.name AS company_name,
      c.logo AS company_logo
    FROM users u
    JOIN companies c ON u.company_id = c.id
    WHERE u.email = ?
  `;

  db.query(sql, [email], async (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        company_id: user.company_id
      },
      'SECRET_KEY',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        company_id: user.company_id,
        company_name: user.company_name,
        company_logo: user.company_logo
      }
    });

  });

});


/* ==============================
   ME
================================ */
router.get('/me', (req, res) => {

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SECRET_KEY');

    res.json({ user: decoded });

  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

});

module.exports = router;