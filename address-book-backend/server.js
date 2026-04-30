const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

/* STEP 1: CREATE APP FIRST */
const app = express();

/* STEP 2: MIDDLEWARE */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* STEP 3: IMPORT ROUTES */
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const emailCampaignRoutes = require('./routes/email-campaigns');

/* STEP 4: USE ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/email-campaigns', emailCampaignRoutes);

/* ==============================================
   STEP 4.5: SERVE FRONTEND (FOR ELECTRON/PROD)
============================================== */
const frontendPath = path.join(__dirname, '../address-book-frontend/dist/address-book-frontend/browser');
app.use(express.static(frontendPath));

// Handle Angular SPA routing
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    next();
  }
});

/* STEP 5: START SERVER */
const PORT = process.env.PORT || 3000;
const db = require('./config/db');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Verify DB connection on startup
  db.getConnection((err, connection) => {
    if (err) {
      console.error('CRITICAL: Database connection failed during startup!');
    } else {
      console.log('Database verified and ready.');
      connection.release();
    }
  });
});