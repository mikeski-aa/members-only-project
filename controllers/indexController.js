const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const pool = require("../config/pool");
const genPassword = require("../lib/passwordUtils").genPassword;
const authCheck = require("../routes/authMiddleware").authCheck;
require("dotenv").config;
// GET index
exports.getIndex = asyncHandler(async (req, res, next) => {
  const posts = await pool.query(
    `SELECT username, message, date, posts.id FROM users JOIN posts ON users.id = user_id ORDER BY date DESC`
  );

  console.log(req.user.rows[0]);
  res.render("index", { user: req.user, posts: posts.rows });
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
          const saltHash = await genPassword(req.body.password);
          // const salt = saltHash.salt;
          // const hash = saltHash.hash;

          const newUser = [
            req.body.username,
            saltHash,
            0,
            req.body.firstName,
            req.body.lastName,
            false,
            false,
          ];

          await pool.query(
            `INSERT INTO users (username, hash, salt, firstname, lastname, isAdmin, memberstatus) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            newUser
          );

          res.redirect("/login");
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

// GET LOGIN FAIL
exports.getLoginFail = asyncHandler(async (req, res, next) => {
  res.render("loginfail");
});

// get logout
exports.getLogout = asyncHandler(async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

// GET CREATE MESSAGE
exports.getCreateMessage = asyncHandler(async (req, res, next) => {
  res.render("createMessage", { user: req.user });
});

// POST create message
exports.postCreateMessage = [
  body(
    "message",
    "Your message must be longer than one character and shorter than 100 characters"
  )
    .isLength({ min: 1, max: 100 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // errors present, re render
      return res.render("createMessage", {
        user: req.user,
        errors: errors.array(),
      });
    }

    try {
      const date = new Date();
      const post = [req.body.message, date, req.user.rows[0].id];
      await pool.query(
        `INSERT INTO posts (message, date, user_id) VALUES ($1, $2, $3)`,
        post
      );
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  }),
];

// get delete form
exports.getDelete = asyncHandler(async (req, res, next) => {
  try {
    const postinfo = await pool.query(
      "SELECT username, message, date, posts.id FROM users JOIN posts ON users.id = user_id WHERE posts.id = $1",
      [req.params.id]
    );

    res.render("deletepost", { user: req.user, post: postinfo.rows[0] });
  } catch (error) {
    next(error);
  }
});

// post delete form
exports.postDelete = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.body.targetID);
    await pool.query("DELETE FROM posts WHERE id = $1", [req.body.targetID]);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// get memberstatus
exports.getMembercheck = asyncHandler(async (req, res, next) => {
  res.render("membercheck", { user: req.user });
});

// post memberstatus
exports.postMembercheck = [
  body("membercode", "Invalid secret passcode entered")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // errors present, re render
      return res.render("membercheck", {
        user: req.user,
        errors: errors.array(),
      });
    }

    if (req.body.membercode === process.env.MEM_PASS) {
      try {
        console.log("correct entered");
        await pool.query("UPDATE users SET memberstatus = true WHERE id = $1", [
          req.user.rows[0].id,
        ]);

        res.redirect("/memberstatus");
        return;
      } catch (err) {
        next(err);
      }
    } else {
      res.render("membercheck", {
        user: req.user,
        error: "Incorrect club pass entered",
      });
    }
  }),
];
