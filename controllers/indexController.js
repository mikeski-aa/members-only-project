var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const pool = require("../config/pool");
const genPassword = require("../lib/passwordUtils").genPassword;
const validPassword = require("../lib/passwordUtils").validPassword;
const passport = require("passport");

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
        const checkExisting = await pool.query(
          "SELECT username FROM users WHERE username = $1",
          [req.body.username]
        );

        if (checkExisting.rows.length > 0) {
          // check if username exists, if it does, give error and re-render signup
          res.render("signup", {
            fname: req.body.firstName,
            lname: req.body.lastName,
            uname: req.body.username,
            pw: req.body.password,
            pwc: req.body.passwordConfirm,
            errors: [
              {
                msg: "Username already exists, please select a different username",
              },
            ],
          });
          return;
        } else {
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
        }
      } catch (error) {
        next(error);
      }
    }
  }),
];

// GET LOGIN
exports.getLogin = asyncHandler(async (req, res, next) => {
  res.render("login");
});

// POST LOGIN

// exports.postLogin = [
//   body("username", "Username not be empty")
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),
//   body("password", "Password is required!")
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),
//   passport.authenticate("local", {
//     failureRedirect: "/login-failure",
//     successRedirect: "/login-success",
//   }),
// ];

// exports.postLogin = [
//   body("username", "Username not be empty")
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),
//   body("password", "Password is required!")
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // errors found, re render login form
//       res.render("login", { uname: req.body.username, errors: errors.array() });
//     } else {
//       try {
//         const details = await pool.query(
//           "SELECT hash, salt FROM users WHERE username = $1",
//           [req.body.username]
//         );
//         const isValid = validPassword(
//           req.body.password,
//           details.hash,
//           details.salt
//         );

//         if (!isValid) {
//           // invalid login password, re render
//           res.render("login", {
//             uname: req.body.username,
//             errors: [{ msg: "Invalid username or password" }],
//           });
//         } else {

//         }
//       } catch (err) {
//         next(err);
//       }
//     }
//   }),
// ];
