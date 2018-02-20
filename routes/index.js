var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var middleware = require("../middleware");
var defaultPath = "/books/page/1/sort/-views";

router.get("/", (req, res) => res.render("landing"));

router.get("/register", (req, res) => res.render("register", { isLoginOrSignupPage: true }));

router.post("/register", (req, res) => {
  if (req.body.username && req.body.password) {
    var newUser;
    if (req.body.isAdmin == null) {
      newUser = new User({ username: req.body.username, isAdmin: false });
    } else {
      newUser = new User({ username: req.body.username, isAdmin: true });
    }
    User.register(newUser, req.body.password, function(err, registeredUser) {
      if (err) {
        req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
        res.redirect("register");
      } else {
        if (!req.isAuthenticated()) {
          req.flash("success", "You have been successfully registered. Welcome!")
          passport.authenticate("local")(req, res, function() {
            res.redirect(defaultPath);
          });
        } else {
          res.redirect(defaultPath);
        }
      }
    });
  } else {
    req.flash("error", "At least one of the fields is empty. Please re-enter your details and try again.");
    res.redirect("/register");
  }
});

router.get("/login", middleware.isNotLoggedIn, (req, res) => res.render("login", { isLoginOrSignupPage: true }));

router.post("/login", passport.authenticate("local", {
  successRedirect: defaultPath,
  failureRedirect: "/login",
  successFlash: "Welcome back!",
  failureFlash: "Invalid username or password.",
}), (req, res) => { /* empty function */ });

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You have been successfully logged out.")
  res.redirect("/");
})

module.exports = router;
