var express = require("express");
var router = express.Router();
var BookRequest = require("../models/request");
var Genre = require("../models/genre");
var middleware = require("../middleware");
var defaultPath = "/books";
var defaultError = middleware.defaultError;

// index of all book requests
// only visible to admin
router.get("/all", middleware.checkAdmin, (req, res) => {
  BookRequest.find({}, function(err, foundRequests) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect(defaultPath);
    } else {
      res.render("book_requests/index", { requests: foundRequests });
    }
  });
});

// book request route
// anyone can request a book
router.get("/", middleware.isLoggedIn, (req, res) => {
  Genre.find({}, null, { sort: "name" }, function(err, foundGenres) {
    if (err) {
      defaultError(req, res);
    } else {
      res.render("book_requests/new", { genres: foundGenres });
    }
  });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
  if (req.body.title && req.body.author) {
    var newRequest = {
      title: req.body.title,
      author: req.body.author,
      genres: req.body.genres,
    };
    BookRequest.create(newRequest, function(err, createdRequest) {
      if (err || !createdRequest) {
        req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
        res.redirect("/books/request");
      } else {
        req.flash("success", "Your request has been sent. One of our administrators shall add the book to the database shortly.")
        res.redirect(defaultPath);
      }
    });
  } else {
    req.flash("error", "At least one of the fields is empty. Please re-enter the book request details.")
    res.redirect("/books/request");
  }
});

router.delete("/:request_id", middleware.checkAdmin, (req, res) => {
  BookRequest.findByIdAndRemove(req.params.request_id, function(err) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
    }
    res.redirect("/books/request/all");
  });
});

module.exports = router;
