module.exports = (req, res, next) => {
    // restrict processes except admin role/roles
    if (req.user.role !== 'admin') {
      // 403 -> forbidden
      return res.status(403).json({ message: 'Admin access required!' });
    }
    next();
  };