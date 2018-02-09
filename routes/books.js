var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var BookRequest = require("../models/request");


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
// takes a book request and asks for more information from admins
// before a book is added to the database
// only admins can create a new book
router.get("/new/:request_id", (req, res) => {
  BookRequest.findById(req.params.request_id, function(err, foundRequest) {
    if (err || !foundRequest) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("books/new", { request: foundRequest });
    }
  });
});

// create route
// only admins can create a new book
router.post("/new/:request_id", (req, res) => {
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
        BookRequest.findByIdAndRemove(req.params.request_id, function(err) {
          if (err) {
            console.log(err);
            res.redirect("back");
          } else {
            res.redirect("/books/");
          }
        });
      }
    });
  } else {
    res.redirect("books/new");
  }
});

// show route
router.get("/:id", (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      res.redirect("back");
    } else {
      res.render("books/show", { book: foundBook });
    }
  });
});

module.exports = router;
