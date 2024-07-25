var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
require("dotenv").config();
const pool = require("./config/pool");
const pgSession = require("connect-pg-simple")(session);
require("./config/passport");
const passport = require("passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// set up pgSession
// table needs to be set up as per: https://github.com/voxpelli/node-connect-pg-simple/blob/HEAD/table.sql
const sessionStore = new pgSession({
  pool: pool,
  tableName: "session",
});

// set up session usage
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // one day
  })
);

// set up passport use
app.use(passport.session());
app.use((req, res, next) => {
  // console.log(req.session);
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { user: req.user });
});

module.exports = app;
