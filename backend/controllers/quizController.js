const QuizScore = require('../models/QuizScore');
const User = require('../models/User');

// @desc    Save mock quiz score
// @route   POST /api/quizzes/score
// @access  Private (Student)
const saveQuizScore = async (req, res) => {
  try {
    const { subject, score, totalQuestions, difficulty } = req.body;

    if (score === undefined || !subject || !totalQuestions || !difficulty) {
      return res.status(400).json({ message: 'All quiz attempt fields are required' });
    }

    const quizAttempt = await QuizScore.create({
      user: req.user._id,
      subject,
      score,
      totalQuestions,
      difficulty,
    });

    res.status(201).json(quizAttempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall student leaderboard
// @route   GET /api/quizzes/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    // Aggregate attempts grouped by user
    const leaderboard = await QuizScore.aggregate([
      {
        $group: {
          _id: '$user',
          averageScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 },
          maxQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$score' }
        }
      },
      { $sort: { averageScore: -1, totalAttempts: -1 } }
    ]);

    // Populate user details manually since aggregate populate is complex
    const populated = await Promise.all(
      leaderboard.map(async (row) => {
        const student = await User.findById(row._id).select('name email department');
        return {
          ...row,
          student: student || { name: 'Unknown Student', email: '—', department: '—' }
        };
      })
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats for logged in student
// @route   GET /api/quizzes/stats
// @access  Private (Student)
const getStudentStats = async (req, res) => {
  try {
    const attempts = await QuizScore.find({ user: req.user._id }).sort({ createdAt: -1 });

    const totalQuizzes = attempts.length;
    let avgScore = 0;
    if (totalQuizzes > 0) {
      const sum = attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
      avgScore = Math.round(sum / totalQuizzes);
    }

    res.json({
      totalQuizzes,
      avgScore,
      attempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveQuizScore,
  getLeaderboard,
  getStudentStats
};
