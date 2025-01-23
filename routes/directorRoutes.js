const express = require('express');

const directorController = require('../controllers/directorController');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, directorController.getAllDirectors);
router.post('/', [auth, admin], directorController.createDirector);
router.delete('/:id', [auth, admin], directorController.deleteDirector);

module.exports = router;