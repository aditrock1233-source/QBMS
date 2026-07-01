const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'TrueFalse', 'ShortAnswer', 'LongAnswer', 'CaseStudy', 'Programming'],
      required: true,
    },
    options: {
      type: [String], // only used for MCQ
      default: [],
    },
    correctAnswer: {
      type: String,
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    bloomLevel: {
      type: String,
      enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Review'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usageCount: {
      type: Number,
      default: 0, // how many times used in papers - for analytics
    },
  },
  { timestamps: true }
);

// Helpful index for fast filtering
questionSchema.index({ subject: 1, difficulty: 1, status: 1 });

module.exports = mongoose.model('Question', questionSchema);
