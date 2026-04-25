const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('❌ Auth Failed: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SECRET_KEY');
    
    // Attach user info to request
    req.user = decoded;
    
    console.log(`✅ Auth Success: User ${decoded.email} from Company ${decoded.company_id}`);
    next();
  } catch (err) {
    console.error('❌ Auth Failed: Invalid token', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};