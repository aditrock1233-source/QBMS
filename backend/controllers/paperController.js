const QuestionPaper = require('../models/QuestionPaper');
const Question = require('../models/Question');
const { generateMultipleSets } = require('../utils/paperGenerator');
const { generatePaperPDF } = require('../utils/pdfGenerator');

// @desc    Generate a new randomized question paper (with multiple sets)
// @route   POST /api/papers/generate
// @access  Private (Faculty, ExamCell, Admin)
const generatePaper = async (req, res) => {
  try {
    const {
      title,
      subject,
      examType,
      totalMarks,
      durationMinutes,
      difficultyMix, // { easy: 30, medium: 50, hard: 20 }
      sections,      // [{ sectionName, questionType, numberOfQuestions, marksPerQuestion }]
      numberOfSets,  // e.g. 4
    } = req.body;

    if (!sections || sections.length === 0) {
      return res.status(400).json({ message: 'At least one section pattern is required' });
    }

    const sets = await generateMultipleSets(
      subject,
      sections,
      difficultyMix || { easy: 30, medium: 50, hard: 20 },
      numberOfSets || 1
    );

    const paper = await QuestionPaper.create({
      title,
      subject,
      examType,
      totalMarks,
      durationMinutes,
      difficultyMix,
      sections,
      sets,
      generatedBy: req.user._id,
    });

    // Mark questions as used (for analytics - "Most Used Questions")
    const allUsedIds = sets.flatMap((s) => s.questions);
    await Question.updateMany(
      { _id: { $in: allUsedIds } },
      { $inc: { usageCount: 1 } }
    );

    res.status(201).json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Preview a paper (full details with populated questions)
// @route   GET /api/papers/:id
// @access  Private
const getPaperById = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id).populate({
      path: 'sets.questions',
      model: 'Question',
    });

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all generated papers
// @route   GET /api/papers
// @access  Private
const getAllPapers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.status) filter.status = req.query.status;

    const papers = await QuestionPaper.find(filter)
      .populate('generatedBy', 'name email')
      .select('-sets.questions') // skip heavy question data in list view
      .sort({ createdAt: -1 });

    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a generated paper
// @route   PUT /api/papers/:id/approve
// @access  Private (HOD, Admin)
const approvePaper = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    paper.status = 'Approved';
    paper.approvedBy = req.user._id;
    const updated = await paper.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download a specific set of a paper as PDF
// @route   GET /api/papers/:id/download/:setName
// @access  Private
const downloadPaperPDF = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id).populate({
      path: 'sets.questions',
      model: 'Question',
    });

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const set = paper.sets.find(
      (s) => s.setName.toLowerCase() === req.params.setName.toLowerCase()
    );

    if (!set) {
      return res.status(404).json({ message: 'Set not found in this paper' });
    }

    generatePaperPDF(paper, set, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a paper
// @route   DELETE /api/papers/:id
// @access  Private (Admin)
const deletePaper = async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    await paper.deleteOne();
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generatePaper,
  getPaperById,
  getAllPapers,
  approvePaper,
  downloadPaperPDF,
  deletePaper,
};
