const express = require('express');
const cors = require('cors');

/* STEP 1: CREATE APP FIRST */
const app = express();

/* STEP 2: MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* STEP 3: IMPORT ROUTES */
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const emailCampaignRoutes = require('./routes/email-campaigns');

/* STEP 4: USE ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/email-campaigns', emailCampaignRoutes);

/* STEP 5: START SERVER */
app.listen(3000, () => {
  console.log('Server running on port 3000');
});