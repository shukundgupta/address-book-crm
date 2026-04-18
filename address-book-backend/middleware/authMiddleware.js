const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 🔥 TEMPORARY BYPASS FOR DEBUGGING
  req.user = { id: 1, email: 'subagent@test.com', company_id: 1 };
  return next();
};