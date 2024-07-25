const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const pool = require("../config/pool");
const genPassword = require("../lib/passwordUtils").genPassword;
const authCheck = require("../routes/authMiddleware").authCheck;
// GET index
exports.getIndex = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "Members-only message board",
    user: req.user,
  });
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

// GET MESSAGES
exports.getMessages = asyncHandler(async (req, res, next) => {
  const posts = await pool.query(
    `SELECT username, message, date, posts.id FROM users JOIN posts ON users.id = user_id ORDER BY date DESC`
  );

  console.log(posts.rows);
  res.render("messages", { user: req.user, posts: posts.rows });
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
    try {
      const date = new Date();
      const post = [req.body.message, date, req.user.rows[0].id];
      await pool.query(
        `INSERT INTO posts (message, date, user_id) VALUES ($1, $2, $3)`,
        post
      );
      res.redirect("/messages");
    } catch (error) {
      next(error);
    }
  }),
];

// get post delete form
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
    res.redirect("/messages");
  } catch (error) {
    next(error);
  }
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
