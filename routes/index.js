var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");
const passport = require("passport");
const e = require("express");
/* GET home page. */
router.get("/", indexController.getIndex);

// GET SIGNUP PAGE
router.get("/signup", indexController.getSignUp);

// POST SIGNUP PAGE
router.post("/signup", indexController.postSignUp);
module.exports = router;

// GET LOGIN PAGE
router.get("/login", indexController.getLogin);

// POST LOGIN PAGE
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/",
  })
);
