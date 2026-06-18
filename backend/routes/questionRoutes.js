const express = require('express');
const router = express.Router();

const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
} = require('../controllers/questionController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Stats route must come BEFORE /:id to avoid being treated as an ID
router.get('/stats', protect, getQuestionStats);

router.post('/', protect, authorizeRoles('faculty', 'admin'), createQuestion);
router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestionById);
router.put('/:id', protect, authorizeRoles('faculty', 'admin'), updateQuestion);
router.delete('/:id', protect, authorizeRoles('faculty', 'admin'), deleteQuestion);

module.exports = router;
