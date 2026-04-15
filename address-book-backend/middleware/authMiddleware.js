const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, 'SECRET_KEY');

    req.user = decoded; // 🔥 VERY IMPORTANT

    next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

};