const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true }, // e.g. "Section A"
    questionType: {
      type: String,
      enum: ['MCQ', 'TrueFalse', 'ShortAnswer', 'LongAnswer', 'CaseStudy', 'Programming'],
      required: true,
    },
    numberOfQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
  },
  { _id: false }
);

const paperSetSchema = new mongoose.Schema(
  {
    setName: { type: String, required: true }, // e.g. "Set A"
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  { _id: false }
);

const questionPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ['Internal', 'MidTerm', 'EndSemester', 'UnitTest', 'Placement', 'Mock', 'Assignment'],
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    difficultyMix: {
      easy: { type: Number, default: 30 }, // percentage
      medium: { type: Number, default: 50 },
      hard: { type: Number, default: 20 },
    },
    sections: [sectionSchema],
    sets: [paperSetSchema], // multiple randomized sets (Set A, B, C, D)
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Review'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
