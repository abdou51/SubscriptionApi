const jwt = require('jsonwebtoken');
const secret = process.env.secret;

function generateToken(userId, isAdmin) {
  return jwt.sign(
    {
      userId: userId,
    },
    secret,
    { expiresIn: '1w' }
  );
}

module.exports = generateToken;
