const express = require('express');

const movieController = require('../controllers/movieController');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, movieController.getAllMovies);
router.post('/', [auth, admin], movieController.createMovie);
router.put('/:id', [auth, admin], movieController.updateMovie);
router.delete('/:id', [auth, admin], movieController.deleteMovie);

module.exports = router;