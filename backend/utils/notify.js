const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 * Call this from anywhere (approvalController, paperController, etc.)
 *
 * Example:
 *   const { notify } = require('../utils/notify');
 *   await notify(question.createdBy, 'Your question was approved.', 'QuestionApproved', question._id);
 */
const notify = async (userId, message, type = 'General', relatedId = null) => {
  try {
    if (!userId) return;
    await Notification.create({ user: userId, message, type, relatedId });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

module.exports = { notify };
