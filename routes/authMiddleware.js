module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next();
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isadmin) {
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
