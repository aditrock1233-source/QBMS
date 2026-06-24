const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // the recipient
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['QuestionApproved', 'QuestionRejected', 'PaperGenerated', 'PaperApproved', 'SubjectAdded', 'General'],
      default: 'General',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // questionId or paperId, depending on type
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
