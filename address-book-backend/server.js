const express = require('express');
const cors = require('cors');
const path = require('path');

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
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

/* STEP 5: START SERVER */
app.listen(3000, () => {
  console.log('Server running on port 3000');
});