const express = require('express');

const mongoose = require('mongoose');

const dotenv = require('dotenv');

// for access to variables in .env
dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/directors', require('./routes/directorRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Database connection process
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('-> Connected to MongoDb'))
  .catch(err => console.error('MongoDb connection error:', err));

const PORT = process.env.PORT || 3000; // default -> 3000
app.listen(PORT, () => {
  console.log(`-> Server running on the port ${PORT}`);
});

module.exports = app;