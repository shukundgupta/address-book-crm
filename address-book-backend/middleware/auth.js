const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

  /* ==============================
     GET TOKEN FROM HEADER
  ================================= */
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Expecting: Bearer TOKEN
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  /* ==============================
     VERIFY TOKEN
  ================================= */
  try {

    const decoded = jwt.verify(token, 'SECRET_KEY');

    // Attach user data to request
    req.user = decoded;

    // Example:
    // req.user = {
    //   id,
    //   username,
    //   company_id
    // }

    next();

  } catch (err) {

    return res.status(401).json({ message: 'Invalid or expired token' });

  }

};