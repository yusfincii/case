// import jwt
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // remove prefix -Bearer
    const token = req.header('Authorization').replace('Bearer ', '');

    // given token authorization process
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    // authentication error case
    res.status(401).json({ message: 'Authentication required!' });
  }
};