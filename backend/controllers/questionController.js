const Question = require('../models/Question');
const QuestionVersion = require('../models/QuestionVersion');
const { generateSingleAIQuestion } = require('../utils/aiService');

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

// @desc    Bulk create multiple questions at once
// @route   POST /api/questions/bulk
// @access  Private (Faculty, Admin)
const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Provide a non-empty array of questions.' });
    }

    const results = { created: [], failed: [] };

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        const created = await Question.create({
          title: q.title,
          description: q.description,
          subject: q.subject,
          topic: q.topic,
          questionType: q.questionType,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          difficulty: q.difficulty,
          bloomLevel: q.bloomLevel,
          createdBy: req.user._id,
        });
        results.created.push(created._id);
      } catch (err) {
        results.failed.push({ index: i, title: q.title || '(no title)', error: err.message });
      }
    }

    res.status(201).json({
      message: `${results.created.length} created, ${results.failed.length} failed.`,
      ...results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all questions with search & filter
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, questionType, status, search, page = 1, limit = 20 } = req.query;

    const isStudent = req.user.role === 'student';
    const filter = {};

    if (isStudent) {
      // Students can only access approved questions
      filter.status = 'Approved';
      if (subject) filter.subject = subject;
      if (topic) filter.topic = topic;
      if (difficulty) filter.difficulty = difficulty;

      // Limit to exactly 5 questions, page 1 only
      const questions = await Question.find(filter)
        .populate('topic', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      const total = await Question.countDocuments(filter);

      return res.json({
        questions,
        total,
        page: 1,
        totalPages: Math.ceil(total / 5),
      });
    }

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

// @desc    Update a question (saves a version snapshot of the OLD data before changing)
// @route   PUT /api/questions/:id
// @access  Private (Faculty who created it, or Admin)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Save a snapshot of the question BEFORE we change it
    const lastVersion = await QuestionVersion.findOne({ question: question._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    await QuestionVersion.create({
      question: question._id,
      versionNumber: nextVersionNumber,
      snapshot: question.toObject(),
      editedBy: req.user._id,
    });

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

// @desc    Get version history for a question
// @route   GET /api/questions/:id/versions
// @access  Private
const getQuestionVersions = async (req, res) => {
  try {
    const versions = await QuestionVersion.find({ question: req.params.id })
      .populate('editedBy', 'name email')
      .sort({ versionNumber: -1 });

    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore a question to a previous version
// @route   PUT /api/questions/:id/restore/:versionId
// @access  Private (Faculty, Admin)
const restoreQuestionVersion = async (req, res) => {
  try {
    const version = await QuestionVersion.findById(req.params.versionId);
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Snapshot current state before restoring, so this is undoable too
    const lastVersion = await QuestionVersion.findOne({ question: question._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    await QuestionVersion.create({
      question: question._id,
      versionNumber: nextVersionNumber,
      snapshot: question.toObject(),
      editedBy: req.user._id,
    });

    const fields = [
      'title', 'description', 'subject', 'topic', 'questionType',
      'options', 'correctAnswer', 'marks', 'difficulty', 'bloomLevel',
    ];
    fields.forEach((field) => {
      question[field] = version.snapshot[field];
    });

    const restored = await question.save();
    res.json(restored);
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

    const byBloomLevel = await Question.aggregate([
      { $group: { _id: '$bloomLevel', count: { $sum: 1 } } },
    ]);

    const bySubject = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const mostUsed = await Question.find({ usageCount: { $gt: 0 } })
      .sort({ usageCount: -1 })
      .limit(5)
      .select('title usageCount subject');

    res.json({
      total,
      approved,
      pending,
      rejected,
      byDifficulty,
      byType,
      byBloomLevel,
      bySubject,
      mostUsed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a question using AI on the fly (for form autofill)
// @route   POST /api/questions/generate-ai
// @access  Private (Faculty, Admin)
const generateAIQuestion = async (req, res) => {
  try {
    const { subject, topicPrompt, questionType, difficulty, bloomLevel, customInstructions } = req.body;
    
    if (!subject || !questionType) {
      return res.status(400).json({ message: 'Subject and Question Type are required' });
    }

    const generated = await generateSingleAIQuestion(
      subject,
      topicPrompt,
      questionType,
      difficulty || 'Medium',
      bloomLevel || 'Understand',
      customInstructions
    );

    res.json(generated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  bulkCreateQuestions,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
  getQuestionVersions,
  restoreQuestionVersion,
  generateAIQuestion,
};
