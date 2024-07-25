var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");
const passport = require("passport");
const isAuth = require("../routes/authMiddleware").isAuth;

/* GET home page. */
router.get("/", isAuth, indexController.getIndex);

// GET SIGNUP PAGE
router.get("/signup", indexController.getSignUp);

// POST SIGNUP PAGE
router.post("/signup", indexController.postSignUp);

// GET LOGIN PAGE
router.get("/login", indexController.getLogin);

// POST LOGIN PAGE
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-fail",
    successRedirect: "/",
  })
);

// get login failure

router.get("/login-fail", indexController.getLoginFail);

// post login fail

router.post(
  "/login-fail",
  passport.authenticate("local", {
    failureRedirect: "/login-fail",
    successRedirect: "/",
  })
);

router.get("/logout", indexController.getLogout);

module.exports = router;
