var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");
const passport = require("passport");
const isAuth = require("../routes/authMiddleware").isAuth;
const isAdmin = require("../routes/authMiddleware").isAdmin;
/* GET home page. */
router.get("/", indexController.getIndex);

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

// get for logout
router.get("/logout", indexController.getLogout);

// get for messages
router.get("/messages", indexController.getMessages);

// get for createmessage
router.get("/createmessage", indexController.getCreateMessage);

// get for createmessage
router.post("/createmessage", indexController.postCreateMessage);

// get for deletepost
router.get("/delete/:id", isAdmin, indexController.getDelete);

// post for deletepost
router.post("/delete/:id", isAdmin, indexController.postDelete);

module.exports = router;
