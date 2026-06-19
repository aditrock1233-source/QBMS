const express = require('express');
const router = express.Router();

const {
  getPendingQuestions,
  approveQuestion,
  rejectQuestion,
  getApprovalSummary,
} = require('../controllers/approvalController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/pending', protect, authorizeRoles('hod', 'admin'), getPendingQuestions);
router.get('/summary', protect, authorizeRoles('hod', 'admin'), getApprovalSummary);
router.put('/:id/approve', protect, authorizeRoles('hod', 'admin'), approveQuestion);
router.put('/:id/reject', protect, authorizeRoles('hod', 'admin'), rejectQuestion);

module.exports = router;
