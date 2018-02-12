var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

router.get("/", (req, res) => res.render("landing"));

router.get("/register", (req, res) => res.render("register"));

router.post("/register", (req, res) => {
  var newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function(err, registeredUser) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect("register");
    } else {
      req.flash("success", "You have been successfully registered. Welcome!")
      passport.authenticate("local")(req, res, function() {
        res.redirect("/books");
      });
    }
  });
});

router.get("/login", (req, res) => res.render("login", { isLoginPage: true }));

router.post("/login", passport.authenticate("local", {
  successRedirect: "/books",
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
