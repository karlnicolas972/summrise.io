// reqs
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var User = require("./models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var expressSanitizer = require("express-sanitizer");
var port = process.env.PORT || 9720;
// var databaseURL = process.env.DATABASEURL || "mongodb://localhost/summrise";
var databaseURL = "mongodb://localhost/summrise";

// routes
var indexRoutes = require("./routes/index");
var bookRoutes = require("./routes/books");
var bookRequestRoutes = require("./routes/requests");
var chapterRoutes = require("./routes/chapters");
var genreRoutes = require("./routes/genres");

// app config
mongoose.connect(databaseURL);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(expressSanitizer());

// passport config
app.use(require("express-session")({
  secret: "08Q75cVh9f1M59gcBl87AnTEKr1nlJ0TAh9ljEKI957BgJjxg0zz5dKs3rbaTolm",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// global middleware
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.isLoginOrSignupPage = false;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/books/request", bookRequestRoutes);
app.use("/books/genres", genreRoutes);
app.use("/books/:id/chapters", chapterRoutes);
app.use("/books", bookRoutes);
app.use(indexRoutes);

app.listen(port, () => console.log("summrise.io server active at port " + port));
