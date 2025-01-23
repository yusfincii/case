const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  birthDate: Date,
  bio: String
});

module.exports = mongoose.model('Director', directorSchema);