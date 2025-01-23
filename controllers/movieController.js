const Movie = require('../models/Movie');

// list movies
exports.getAllMovies = async (req, res) => {
  try {
    // retrieves movies with directors
    const movies = await Movie.find().populate('director');

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create movie
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    // 201 -> Created
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update movie
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete movie
exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    // 204 -> No Content
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};