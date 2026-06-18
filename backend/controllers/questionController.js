const Question = require('../models/Question');

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private (Faculty, Admin)
const createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      topic,
      questionType,
      options,
      correctAnswer,
      marks,
      difficulty,
      bloomLevel,
    } = req.body;

    const question = await Question.create({
      title,
      description,
      subject,
      topic,
      questionType,
      options,
      correctAnswer,
      marks,
      difficulty,
      bloomLevel,
      createdBy: req.user._id,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all questions with search & filter
// @route   GET /api/questions
// @access  Private
// Supports query params: subject, topic, difficulty, questionType, status, search
const getQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, questionType, status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    if (status) filter.status = status;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const questions = await Question.find(filter)
      .populate('topic', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Private
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('topic', 'name')
      .populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Faculty who created it, or Admin)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const fields = [
      'title', 'description', 'subject', 'topic', 'questionType',
      'options', 'correctAnswer', 'marks', 'difficulty', 'bloomLevel',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    // If edited after rejection, reset to pending for re-review
    if (question.status === 'Rejected') {
      question.status = 'Pending';
      question.rejectionReason = '';
    }

    const updated = await question.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    await question.deleteOne();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get question bank statistics (for dashboard)
// @route   GET /api/questions/stats
// @access  Private
const getQuestionStats = async (req, res) => {
  try {
    const total = await Question.countDocuments();
    const approved = await Question.countDocuments({ status: 'Approved' });
    const pending = await Question.countDocuments({ status: 'Pending' });
    const rejected = await Question.countDocuments({ status: 'Rejected' });

    const byDifficulty = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const byType = await Question.aggregate([
      { $group: { _id: '$questionType', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      approved,
      pending,
      rejected,
      byDifficulty,
      byType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
};
