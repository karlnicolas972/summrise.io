var express = require("express");
var router = express.Router();
var Book = require("../models/book");

// index route
router.get("/", (req, res) => {
  Book.find({}, function(err, foundBooks) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("books/index", { books: foundBooks });
    }
  });
});

// new route
router.get("/new", (req, res) => res.render("books/new"));

// create route
router.post("/", (req, res) => {
  if (req.body.title && req.body.coverImage && req.body.author) {
    var newBook = {
      title: req.body.title,
      coverImage: req.body.coverImage,
      author: req.body.author,
    };
    Book.create(newBook, function(err, createdBook) {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        console.log(createdBook);
        res.redirect("books");
      }
    });
  } else {
    res.redirect("books/new");
  }
});

// show route
router.get("/:id", function(req, res) {
  Book.findById(req.params.id, function(err, foundBook) {

  });
});

module.exports = router;
