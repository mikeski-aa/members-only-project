const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("./pool");
const { validPassword } = require("../lib/passwordUtils");

// verify callback for new strategy
// done is where you pass results of the authentication to
// https://stackoverflow.com/questions/76855915/confused-help-understanding-passport-js-authenticate-user
// username/pw - value we recieved from request body of a login form

const verifyCallback = (username, password, done) => {
  pool
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then((user) => {
      if (!user) {
        // user not present in DB
        // pass done callback to passport stating user was not found
        return done(null, false);
      }

      // function checking validity from utils -> compares password hash v.s stored hash
      // true or false
      const isValid = validPassword(
        password,
        user.rows[0].hash,
        user.rows[0].salt
      );

      if (isValid) {
        //validation passed
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((err) => {
      done(err);
    });
};

// new strategy requiers verify callback
// LocalStrategy is the name of strategy found on password's site
const strategy = new LocalStrategy(verifyCallback);
passport.use(strategy);

// this has to do with express session
// how we put user into session and out of session

// serialization defines how user information is stored in the session when user successfully authenticates.
passport.serializeUser((user, done) => {
  done(nul, user.rows[0].id);
});

// coming out of the session -> grabbing user ID stored in session finding it in Database
// this function retrieves userid  from session when request is made
passport.deserializeUser((userid, done) => {
  pool
    .query("SELECT * FROM users WHERE id = $1", [userid])
    .then((user) => done(null, user))
    .catch((err) => done(err));
});
