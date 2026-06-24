const mongoose = require('mongoose');

const questionVersionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    snapshot: {
      type: Object, // full copy of the question fields at this point in time
      required: true,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuestionVersion', questionVersionSchema);
