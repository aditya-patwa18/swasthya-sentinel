const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'epiwatch_early_warning_secret_key_2026_health', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
