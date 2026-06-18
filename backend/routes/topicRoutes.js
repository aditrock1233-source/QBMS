const express = require('express');
const router = express.Router();

const {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} = require('../controllers/topicController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('faculty', 'admin'), createTopic);
router.get('/', protect, getTopics);
router.put('/:id', protect, authorizeRoles('faculty', 'admin'), updateTopic);
router.delete('/:id', protect, authorizeRoles('admin'), deleteTopic);

module.exports = router;
