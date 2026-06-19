const express = require('express');
const router = express.Router();

const {
  generatePaper,
  getPaperById,
  getAllPapers,
  approvePaper,
  downloadPaperPDF,
  deletePaper,
} = require('../controllers/paperController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorizeRoles('faculty', 'examcell', 'admin'), generatePaper);
router.get('/', protect, getAllPapers);
router.get('/:id', protect, getPaperById);
router.get('/:id/download/:setName', protect, downloadPaperPDF);
router.put('/:id/approve', protect, authorizeRoles('hod', 'admin'), approvePaper);
router.delete('/:id', protect, authorizeRoles('admin'), deletePaper);

module.exports = router;
