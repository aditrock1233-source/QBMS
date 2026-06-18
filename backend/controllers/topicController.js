const Topic = require('../models/Topic');

// @desc    Create a new topic
// @route   POST /api/topics
// @access  Private (Faculty, Admin)
const createTopic = async (req, res) => {
  try {
    const { name, subject, description } = req.body;

    const topic = await Topic.create({
      name,
      subject,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all topics (optionally filter by subject)
// @route   GET /api/topics
// @access  Private
const getTopics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }
    const topics = await Topic.find(filter).sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Private
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    topic.name = req.body.name || topic.name;
    topic.subject = req.body.subject || topic.subject;
    topic.description = req.body.description || topic.description;

    const updated = await topic.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    await topic.deleteOne();
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTopic, getTopics, updateTopic, deleteTopic };
