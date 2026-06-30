const express = require('express');
const router = express.Router();
const {
  saveQuizScore,
  getLeaderboard,
  getStudentStats,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/score', protect, saveQuizScore);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/stats', protect, getStudentStats);

module.exports = router;
