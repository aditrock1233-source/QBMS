const Question = require('../models/Question');
const { notify } = require('../utils/notify');

// @desc    Get all pending questions for review
// @route   GET /api/approvals/pending
// @access  Private (HOD, Admin)
const getPendingQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ status: 'Pending' })
      .populate('topic', 'name')
      .populate('createdBy', 'name email department')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a question
// @route   PUT /api/approvals/:id/approve
// @access  Private (HOD, Admin)
const approveQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.status = 'Approved';
    question.approvedBy = req.user._id;
    question.rejectionReason = '';

    const updated = await question.save();

    await notify(
      question.createdBy,
      `Your question "${question.title.slice(0, 60)}" was approved.`,
      'QuestionApproved',
      question._id
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a question with feedback
// @route   PUT /api/approvals/:id/reject
// @access  Private (HOD, Admin)
const rejectQuestion = async (req, res) => {
  try {
    const { reason } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.status = 'Rejected';
    question.approvedBy = req.user._id;
    question.rejectionReason = reason || 'Does not meet quality standards';

    const updated = await question.save();

    await notify(
      question.createdBy,
      `Your question "${question.title.slice(0, 60)}" was rejected: ${question.rejectionReason}`,
      'QuestionRejected',
      question._id
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get approval summary stats (for dashboard)
// @route   GET /api/approvals/summary
// @access  Private (HOD, Admin)
const getApprovalSummary = async (req, res) => {
  try {
    const pending = await Question.countDocuments({ status: 'Pending' });
    const approved = await Question.countDocuments({ status: 'Approved' });
    const rejected = await Question.countDocuments({ status: 'Rejected' });

    res.json({ pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve multiple questions at once
// @route   PUT /api/approvals/bulk-approve
// @access  Private (HOD, Admin)
const bulkApproveQuestions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Provide an array of question IDs to approve.' });
    }

    const result = await Question.updateMany(
      { _id: { $in: ids }, status: 'Pending' },
      {
        $set: {
          status: 'Approved',
          approvedBy: req.user._id,
          rejectionReason: '',
        },
      }
    );

    // Retrieve approved questions to trigger notifications
    const approvedQuestions = await Question.find({ _id: { $in: ids } });

    // Send notifications (non-blocking)
    for (const q of approvedQuestions) {
      await notify(
        q.createdBy,
        `Your question "${q.title.slice(0, 60)}" was approved.`,
        'QuestionApproved',
        q._id
      );
    }

    res.json({
      message: `Successfully approved ${result.modifiedCount} questions.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingQuestions,
  approveQuestion,
  rejectQuestion,
  getApprovalSummary,
  bulkApproveQuestions,
};
