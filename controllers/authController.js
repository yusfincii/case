const User = require('../models/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// register
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    // hashing
    const hashedPass = await bcrypt.hash(password, 10); // 10=salt length
    
    const user = await User.create({
      username,
      password: hashedPass, // stores hashed form of password
      role
    });

    // success case
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    // error
    res.status(500).json({ message: error.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
   
    const user = await User.findOne({ username });
    // check credentials with db
    /* for follwing compare method:
    first parameter given is password which as plain text
    nevertheless second parameter is a hashed password which stores in db
    compare method does that hashes first parameter and then compare with the second one */
    if (!user || !await bcrypt.compare(password, user.password)) {
      // 401 -> unauthorized
      return res.status(401).json({ message: 'Invalid credentials!' });
    }
    
    // jwt
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      // expire time determination (1 day)
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    // 500 -> Internal Server Error
    res.status(500).json({ message: error.message });
  }
};