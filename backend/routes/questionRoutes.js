const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/questionController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Stats and bulk routes must come BEFORE /:id to avoid being treated as an ID
router.get('/stats', protect, authorizeRoles('faculty', 'hod', 'examcell', 'admin'), getQuestionStats);
router.post('/bulk', protect, authorizeRoles('faculty', 'admin'), bulkCreateQuestions);
router.post('/generate-ai', protect, authorizeRoles('faculty', 'admin'), generateAIQuestion);

router.post('/', protect, authorizeRoles('faculty', 'admin'), createQuestion);
router.get('/', protect, getQuestions);
router.get('/:id', protect, authorizeRoles('faculty', 'hod', 'examcell', 'admin'), getQuestionById);
router.put('/:id', protect, authorizeRoles('faculty', 'admin'), updateQuestion);
router.delete('/:id', protect, authorizeRoles('faculty', 'admin'), deleteQuestion);

router.get('/:id/versions', protect, authorizeRoles('faculty', 'hod', 'examcell', 'admin'), getQuestionVersions);
router.put('/:id/restore/:versionId', protect, authorizeRoles('faculty', 'admin'), restoreQuestionVersion);

module.exports = router;
