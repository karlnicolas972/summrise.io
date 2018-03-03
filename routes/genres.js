var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var defaultPath = "/books";
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
        if (req.body.genre.books) {
          req.body.genre.books.forEach(function(book_id) {
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
        }
        req.flash("success", `"${createdGenre.name}" added to the list of genres!`);
        res.redirect("/books/genres/new");
      }
    });
  } else {
    req.flash("error", "The 'name' field is empty. Please re-type the name of the genre and try again.");
    res.redirect("/books/genre/new");
  }
});

// show page
router.get("/:genre_id", (req, res) => {
  var page = req.query.page || 1;
  var sort_by = req.query.sort || "title";
  Genre.findById(req.params.genre_id, function(err, foundGenre) {
    if (err || !foundGenre) {
      req.flash("error", "This genre doesn't exist!");
      res.redirect(defaultPath);
    } else {
      Book.count({ genres: foundGenre._id }, function(err, bookCount) {
        if (err) {
          defaultError(req, res);
        } else {
          Book.find({ genres: foundGenre._id }, null, { sort: sort_by })
          .skip((page - 1) * itemsPerPage)
          .limit(itemsPerPage)
          .exec(function(err, foundBooks) {
            if (err) {
              defaultError(req, res);
            } else {
              res.render("genres/show", {
                genre: foundGenre,
                books: foundBooks,
                currentPage: page,
                numPages: Math.ceil(bookCount / itemsPerPage),
                sort_by: sort_by,
              });
            }
          });
        }
      });
    }
  });
});

// edit page
router.get("/:genre_id/edit", middleware.checkAdmin, (req, res) => {
  Genre.findById(req.params.genre_id, function(err, foundGenre) {
    if (err || !foundGenre) {
      req.flash("error", "This genre doesn't exist!");
      res.redirect(defaultPath);
    } else {
      res.render("genres/edit", { genre: foundGenre });
    }
  });
});

// update route
router.put("/:genre_id/", middleware.checkAdmin, (req, res) => {
  Genre.findByIdAndUpdate(req.params.genre_id, req.body.genre, function(err, updatedGenre) {
    if (err || !updatedGenre) {
      req.flash("error", "This genre does not exist!");
      res.redirect(defaultPath);
    } else {
      res.redirect(`/books/genres/${req.params.genre_id}/page/1/sort/title`);
    }
  });
});

router.delete("/:genre_id", middleware.checkAdmin, (req, res) => {
  Genre.findById(req.params.genre_id, function(err, foundGenre) {
    if (err || !foundGenre) {
      req.flash("error", "This genre doesn't exist!");
      res.redirect(defaultPath);
    } else {
      Book.find({ genres: foundGenre._id }, function(err, foundBooks) {
        if (err || !foundBooks) {
          defaultError(req, res);
        } else {
          foundBooks.forEach(function(book) {
            var genreToDelete = book.genres.indexOf(foundGenre._id);
            book.genres.splice(genreToDelete, 1);
            book.save();
          });
          Genre.findByIdAndRemove(foundGenre._id, function(err) {
            if (err) {
              defaultError(req, res);
            } else {
              res.redirect(defaultPath);
            }
          });
        }
      });
    }
  })
});

module.exports = router;
