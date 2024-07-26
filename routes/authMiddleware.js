module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "You are not authorized to view this resource" });
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rows[0].isadmin) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "You are not authorized to view this resource" });
  }
};

module.exports.authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    return 1;
  } else {
    return 0;
  }
};
