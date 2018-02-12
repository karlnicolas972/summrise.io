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
      console.log(err);
      res.redirect("register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/books");
      });
    }
  });
});

router.get("/login", (req, res) => res.render("login"));

router.post("/login", passport.authenticate("local", {
  successRedirect: "/books",
  failureRedirect: "/login",
}), (req, res) => { /* empty function */ });

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

module.exports = router;
