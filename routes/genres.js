var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var defaultPath = "/books/page/1/sort/-views";
var Genre = require("../models/genre");
var Book = require("../models/book");
var itemsPerPage = 12;
var defaultError = middleware.defaultError;

// index route - in books index

// new route
router.get("/new", middleware.checkAdmin, (req, res) => {
  Book.find({}, null, { sort: "title"}, function(err, foundBooks) {
    if (err) {
      defaultError(req, res);
    } else {
      res.render("genres/new", { books: foundBooks });
    }
  });
});

// create route
// this is O(n) complexity where n = # of books in the form
// might need refactoring
router.post("/new", middleware.checkAdmin, (req, res) => {
  if (req.body.genre.name) {
    Genre.create(req.body.genre, function(err, createdGenre) {
      if (err || !createdGenre) {
        req.flash("error", "This genre couldn't be created!");
        res.redirect(defaultPath);
      } else {
        createdGenre.books.forEach(function(book_id) {
          Book.findById(book_id, function(err, foundBook) {
            if (err || !foundBook) {
              req.flash("error", "This book does not exist!");
              res.redirect(defaultPath);
            } else {
              foundBook.genres.push(createdGenre._id);
              foundBook.save();
            }
          });
        });
        req.flash("success", `"${createdGenre.name}" added to the list of genres!`);
        res.redirect("/books/genres/new");
      }
    });
  } else {
    req.flash("error", "The 'name' field is empty. Please re-type the name of the genre and try again.");
    res.redirect("/books/genre/new");
  }
});

router.get("/:genre_id/page/:page_no/sort/:sort_by", (req, res) => {
  Genre.findById(req.params.genre_id, function(err, foundGenre) {
    if (err || !foundGenre) {
      req.flash("error", "This genre doesn't exist!");
      res.redirect(defaultPath);
    } else {
      Book.find({ genres: foundGenre._id }, null, { sort: req.params.sort_by })
      .skip((req.params.page_no - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec(function(err, foundBooks) {
        if (err) {
          defaultError(req, res);
        } else {
          res.render("genres/show", {
            genre: foundGenre,
            books: foundBooks,
            currentPage: req.params.page_no,
            numPages: Math.ceil(foundGenre.books.length / itemsPerPage),
            sort_by: req.params.sort_by,
          });
        }
      });
    }
  });
});


module.exports = router;
