var express = require("express");
var router = express.Router();
var BookRequest = require("../models/request");

// index of all book requests
// only visible to admin
router.get("/all", (req, res) => {
  BookRequest.find({}, function(err, foundRequests) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect("/books");
    } else {
      res.render("book_requests/index", { requests: foundRequests });
    }
  });
});

// book request route
// anyone can request a book
router.get("/", (req, res) => res.render("book_requests/new"));

router.post("/", (req, res) => {
  if (req.body.title && req.body.author) {
    var newRequest = {
      title: req.body.title,
      author: req.body.author,
    };
    BookRequest.create(newRequest, function(err, createdRequest) {
      if (err || !createdRequest) {
        req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
        res.redirect("/books/request");
      } else {
        res.redirect("/books");
      }
    });
  } else {
    req.flash("error", "At least one of the fields is empty. Please re-enter the book request details.")
    res.redirect("/books/request");
  }
});

router.delete("/:request_id", (req, res) => {
  BookRequest.findByIdAndRemove(req.params.request_id, function(err) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect("back");
    } else {
      res.redirect("/books/request/all");
    }
  });
});

module.exports = router;
