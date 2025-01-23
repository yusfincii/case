const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  releaseDate: Date,
  genre: String,
  rating: Number,
  imdbId: String,
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Director'
  }
});

module.exports = mongoose.model('Movie', movieSchema);