// Load environment variables first
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
  'http://localhost:3000',
  'https://qbms-iota.vercel.app'
],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
// Debug (remove after confirming connection)
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Not Loaded ❌");
console.log("PORT:", process.env.PORT);

// Routes
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const questionRoutes = require('./routes/questionRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const paperRoutes = require('./routes/paperRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const quizRoutes = require('./routes/quizRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/quizzes', quizRoutes);

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QBMS API is running 🚀'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB');
    console.error(err.message);
  });