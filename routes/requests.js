var express = require("express");
var router = express.Router();
var BookRequest = require("../models/request");

// index of all book requests
// only visible to admin
router.get("/all", (req, res) => {
  BookRequest.find({}, function(err, foundRequests) {
    if (err) {
      console.log(err);
      res.redirect("back");
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
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        res.redirect("/books");
      }
    });
  } else {
    res.redirect("/books");
  }
});

module.exports = router;
