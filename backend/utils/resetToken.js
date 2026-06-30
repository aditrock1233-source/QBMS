const crypto = require('crypto');

/**
 * Generates a random reset token and its hashed version.
 * The plain token gets sent to the user (in a real email).
 * The hashed version is what we store in the database.
 * This way, even if the database is compromised, raw tokens aren't exposed.
 */
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateResetToken, hashToken };
