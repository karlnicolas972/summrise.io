var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var BookRequest = require("../models/request");
var Chapter = require("../models/chapter");
var Genre = require("../models/genre");
var middleware = require("../middleware");
var expressSanitizer = require("express-sanitizer");
var itemsPerPage = 12;
var defaultPath = "/books";
var defaultError = middleware.defaultError;

// sorted paginated index route
router.get("/", (req, res) => {
  var page = req.query.page || 1;
  var sort_by = req.query.sort || "-views";
  Book.count({}, function(err, bookCount) {
    if (err) {
      defaultError(req, res);
    } else {
      Genre.find({}, null, { sort: "name" }, function(err, foundGenres) {
        if (err) {
          defaultError(req, res);
        } else {
          Book.find({}, null, { sort: sort_by })
          .skip((page - 1) * itemsPerPage)
          .limit(itemsPerPage)
          .exec(function(err, foundBooks) {
            if (err) {
              defaultError(req, res);
            } else {
              res.render("books/index", {
                books: foundBooks,
                genres: foundGenres,
                numPages: Math.ceil(bookCount / itemsPerPage),
                currentPage: page,
                sort_by: sort_by,
              });
            }
          });
        }
      });
    }
  });
});

// sorted paginated search routes
router.get("/search", (req, res) => {
  if (req.query.key) {
    var page = req.query.page || 1;
    var sort_by = req.query.sort || "-views";
    Book.count({ $text: { $search: req.query.key }}, function(err, bookCount) {
      if (err) {
        defaultError(req, res);
      } else {
        Genre.find({}, null, { sort: "name" }, function(err, foundGenres) {
          if (err) {
            defaultError(req, res);
          } else {
            Book.find({ $text: { $search: req.query.key }}, null, { sort: sort_by })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec(function(err, foundBooks) {
              if (err) {
                defaultError(req, res);
              } else {
                res.render("books/search", {
                  books: foundBooks,
                  searchTerm: req.query.key,
                  numPages: Math.ceil(bookCount / itemsPerPage),
                  currentPage: page,
                  sort_by: sort_by,
                });
              }
            });
          }
        });
      }
    });
  } else {
    res.render("books/search", { searchTerm: null, books: [], numPages: 0 });
  }
});

// add to favourites route
router.get("/favourites/:id", middleware.isLoggedIn, (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book doesn't exist!");
      res.redirect(defaultPath);
    } else {
      req.user.favouriteBooks.push(foundBook._id);
      req.user.save();
      req.flash("success", `"${foundBook.title}" has been successfully added to your Favourites!`);
      res.redirect("back");
    }
  });
});

// remove from favourites route
router.get("/favourites/remove/:id", middleware.isLoggedIn, (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book doesn't exist!");
      res.redirect(defaultPath);
    } else {
      var toBeRemoved = req.user.favouriteBooks.indexOf(foundBook._id);
      req.user.favouriteBooks.splice(toBeRemoved, 1);
      req.user.save();
      req.flash("success", `"${foundBook.title}" has been successfully removed from your Favourites!`);
      res.redirect("back");
    }
  });
});


// new route
router.get("/new", middleware.checkAdmin, (req, res) => {
  Genre.find({}, function(err, foundGenres) {
    if (err) {
      defaultError(req, res);
    } else {
      res.render("books/new", { request: null, genres: foundGenres });
    }
  });
});

// create route
router.post("/new", middleware.checkAdmin, (req, res) => {
  req.body.description = req.sanitize(req.body.description);
  if (req.body.title && req.body.author && req.body.description) {
    var newBook = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      genres: req.body.genres,
      views: 0,
    };
    Book.create(newBook, function(err, createdBook) {
      if (err) {
        defaultError(req, res);
      } else {
        res.redirect(defaultPath);
      }
    });
  } else {
    req.flash("error", "At least one of the fields is empty!")
    res.redirect("/books/new");
  }
});

// new route with request
// takes a book request and asks for more information from admins
// before a book is added to the database
// only admins can create a new book
router.get("/new/:request_id", middleware.checkAdmin, (req, res) => {
  Genre.find({}, function(err, foundGenres) {
    if (err) {
      defaultError(req, res);
    } else {
      BookRequest.findById(req.params.request_id)
      .populate("genres")
      .exec(function(err, foundRequest) {
        if (err || !foundRequest) {
          req.flash("error", "This request does not exist!")
          res.redirect("/books/request/all");
        } else {
          res.render("books/new", { request: foundRequest, genres: foundGenres });
        }
      });
    }
  });
});

// create route with request
// only admins can create a new book
router.post("/new/:request_id", middleware.checkAdmin, (req, res) => {
  req.body.description = req.sanitize(req.body.description);
  if (req.body.title && req.body.author && req.body.description) {
    var newBook = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      genres: req.body.genres,
      views: 0,
    };
    Book.create(newBook, function(err, createdBook) {
      if (err) {
        defaultError(req, res);
      } else {
        BookRequest.findByIdAndRemove(req.params.request_id, function(err) {
          if (err) {
            defaultError(req, res);
          } else {
            res.redirect(defaultPath);
          }
        });
      }
    });
  } else {
    req.flash("error", "At least one of the fields is empty!")
    res.redirect("/books/new/" + req.params.request_id);
  }
});

// show route - only user's chapters
router.get("/:id", (req, res) => {
  Book.findById(req.params.id).populate({
    path: "chapters",
    options: { sort: "number" },
  }).populate("genres").exec(function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect(defaultPath);
    } else {
      foundBook.views++;
      foundBook.save();
      res.render("books/showPrivate", { book: foundBook });
    }
  });
});

// show route - all public chapters
// this function is probably really inefficient
// needs to find a better way to do this
router.get("/:id/public/page/:page_no/sort/:sort_by", (req, res) => {
  Book.findById(req.params.id).populate("genres").exec(function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect(defaultPath);
    } else {
      Chapter.count({ book: { id: foundBook._id }, isPublic: true }, function(err, chapterCount) {
        if (err) {
          defaultError(req, res);
        } else {
          Chapter.find({ book: { id: foundBook._id }, isPublic: true }, null, { sort: req.params.sort_by })
          .skip((req.params.page_no - 1) * itemsPerPage)
          .limit(itemsPerPage)
          .exec(function(err, foundChapters) {
            if (err) {
              defaultError(req, res);
            } else {
              foundBook.views++;
              foundBook.save();
              res.render("books/showPublic", {
                book: foundBook,
                chapters: foundChapters,
                currentPage: req.params.page_no,
                numPages: Math.ceil(chapterCount / itemsPerPage),
                sort_by: req.params.sort_by,
              });
            }
          });
        }
      });
    }
  });
});

// catcher route for public show page
router.get("/:id/public", (req, res) => res.redirect(`/books/${req.params.id}/public/page/1/sort/number`));

// edit route
router.get("/:id/edit", middleware.checkAdmin, (req, res) => {
  Genre.find({}, function(err, foundGenres) {
    if (err) {
      defaultError(req, res);
    } else {
      Book.findById(req.params.id).populate("genres").exec(function(err, foundBook) {
        if (err || !foundBook) {
          req.flash("error", "This book does not exist!");
          res.redirect(defaultPath);
        } else {
          res.render("books/edit", { book: foundBook, genres: foundGenres });
        }
      });
    }
  });
});

// update route
router.put("/:id", middleware.checkAdmin, (req, res) => {
  req.body.book.description = req.sanitize(req.body.book.description);
  Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, updatedBook) {
    if (err || !updatedBook) {
      req.flash("error", "This book does not exist!");
    }
    res.redirect(defaultPath);
  });
});

// destroy route
router.delete("/:id", middleware.checkAdmin, (req, res) => {
  Book.findById(req.params.id).populate("genres").exec(function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect(defaultPath);
    } else {
      Chapter.remove({ book: { id: foundBook._id } }, function(err) {
        if (err) {
          defaultError(req, res);
        } else {
          Book.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
              defaultError(req, res);
            } else {
              req.flash("success", `"${foundBook.title}" successfully deleted.`);
              res.redirect(defaultPath);
            }
          });
        }
      });
    }
  });
});

module.exports = router;
