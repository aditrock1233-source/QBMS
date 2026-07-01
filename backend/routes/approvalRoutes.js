const express = require('express');
const router = express.Router();

const {
  getPendingQuestions,
  approveQuestion,
  rejectQuestion,
  getApprovalSummary,
  bulkApproveQuestions,
  bulkRejectQuestions,
  bulkDeleteQuestions,
  reviewQuestion,
} = require('../controllers/approvalController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/pending', protect, authorizeRoles('hod', 'admin', 'examcell'), getPendingQuestions);
router.get('/summary', protect, authorizeRoles('hod', 'admin', 'examcell'), getApprovalSummary);
router.put('/bulk-approve', protect, authorizeRoles('hod', 'admin'), bulkApproveQuestions);
router.put('/bulk-reject', protect, authorizeRoles('admin'), bulkRejectQuestions);
router.post('/bulk-delete', protect, authorizeRoles('admin', 'examcell'), bulkDeleteQuestions);
router.delete('/bulk-delete', protect, authorizeRoles('admin', 'examcell'), bulkDeleteQuestions);
router.put('/:id/review', protect, authorizeRoles('hod', 'admin', 'examcell'), reviewQuestion);
router.put('/:id/approve', protect, authorizeRoles('hod', 'admin'), approveQuestion);
router.put('/:id/reject', protect, authorizeRoles('hod', 'admin'), rejectQuestion);

module.exports = router;
