var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const pool = require("../config/pool");
const genPassword = require("../lib/passwordUtils").genPassword;

// GET index
exports.getIndex = asyncHandler(async (req, res, next) => {
  res.render("index", { title: "Members-only message board" });
});

// GET sign up form
exports.getSignUp = asyncHandler(async (req, res, next) => {
  res.render("signup");
});

// POST sign up form
exports.postSignUp = [
  body("firstName", "First name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username is required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password is required, must be at least 5 characters long")
    .trim()
    .isLength({ min: 5 })
    .escape(),
  body(
    "passwordConfirm",
    "Passwords must match, both passwords must be at least 5 characters long"
  )
    .trim()
    .isLength({ min: 5 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // errors in validation found
      res.render("signup", {
        fname: req.body.firstName,
        lname: req.body.lastName,
        uname: req.body.username,
        errors: errors.array(),
      });
    } else if (req.body.password != req.body.passwordConfirm) {
      res.render("signup", {
        fname: req.body.firstName,
        lname: req.body.lastName,
        uname: req.body.username,
        errors: [{ msg: "Passwords must match!" }],
      });
    } else {
      try {
        const saltHash = genPassword(req.body.password);
        const salt = saltHash.salt;
        const hash = saltHash.hash;

        const newUser = [
          req.body.username,
          hash,
          salt,
          req.body.firstName,
          req.body.lastName,
          false,
        ];

        await pool.query(
          `INSERT INTO users (username, hash, salt, firstname, lastname, isAdmin) VALUES ($1, $2, $3, $4, $5, $6)`,
          newUser
        );

        res.redirect("/");
      } catch (error) {
        next(error);
      }
    }
  }),
];
