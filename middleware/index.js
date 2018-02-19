var Chapter = require("../models/chapter");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You are not logged in. Please log in to perform this action.");
  res.redirect("/login");
};

middlewareObj.isNotLoggedIn = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "There is already a user account logged in. Please log out first to perform this action.");
  res.redirect("/books/page/1/sort/title");
};

middlewareObj.checkAdmin = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      next();
    } else {
      req.flash("error", "Your user account does not have permission to perform this action.");
      res.redirect("/books/page/1/sort/title");
    }
  } else {
    req.flash("error", "You are not logged in. Please log in to perform this action.");
    res.redirect("/login");
  }
}

middlewareObj.checkChapterOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Chapter.findById(req.params.chapter_id, function(err, foundChapter) {
      if (err || !foundChapter) {
        req.flash("error", "This chapter does not exist!");
        res.redirect("/books/" + req.params.id);
      } else {
        if (foundChapter.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "Your user account does not have permission to perform this action.");
          res.redirect("/books/" + req.params.id);
        }
      }
    });
  } else {
    req.flash("error", "You are not logged in. Please log in to perform this action.");
    res.redirect("/login");
  }
};

module.exports = middlewareObj;
