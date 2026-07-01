const express = require('express');
const router = express.Router();

const {
  generatePaper,
  getPaperById,
  getAllPapers,
  approvePaper,
  downloadPaperPDF,
  deletePaper,
  disapprovePaper,
  reviewPaper,
} = require('../controllers/paperController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorizeRoles('faculty', 'examcell', 'admin'), generatePaper);
router.get('/', protect, authorizeRoles('faculty', 'hod', 'examcell', 'admin'), getAllPapers);
router.get('/:id', protect, authorizeRoles('faculty', 'hod', 'examcell', 'admin'), getPaperById);
router.get('/:id/download/:setName', protect, authorizeRoles('faculty', 'hod', 'examcell', 'admin'), downloadPaperPDF);
router.put('/:id/approve', protect, authorizeRoles('hod', 'admin'), approvePaper);
router.put('/:id/disapprove', protect, authorizeRoles('admin'), disapprovePaper);
router.put('/:id/review', protect, authorizeRoles('hod', 'admin', 'examcell'), reviewPaper);
router.delete('/:id', protect, authorizeRoles('admin'), deletePaper);

module.exports = router;
