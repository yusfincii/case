const Director = require('../models/Director');

// create director
exports.createDirector = async (req, res) => {
  try {
    const director = await Director.create(req.body);

    // 201 -> Created
    res.status(201).json(director);
  } catch (error) {
    // 500 -< Internal Server Error
    res.status(500).json({ message: error.message });
  }
};

// delete director
exports.deleteDirector = async (req, res) => {
  try {
    await Director.findByIdAndDelete(req.params.id);
    // 204 -> No Content
    // because of result of delete process
    res.status(204).send();
  } catch (error) {
    // error case -such as no match with given parameters
    res.status(500).json({ message: error.message });
  }
};

// list directos
exports.getAllDirectors = async (req, res) => {
  try {
    const directors = await Director.find(); // no filter

    res.json(directors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

