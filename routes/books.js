var express = require("express");
var router = express.Router();
var Book = require("../models/book");
var BookRequest = require("../models/request");
var Chapter = require("../models/chapter");
var middleware = require("../middleware");
var expressSanitizer = require("express-sanitizer");
var itemsPerPage = 16;

// index route
router.get("/", (req, res) => res.redirect("/books/page/1"));

// paginated index route
router.get("/page/:page_no", (req, res) => {
  Book.count({}, function(err, bookCount) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect("back");
    } else {
      Book.find({}).skip((req.params.page_no - 1) * itemsPerPage).limit(itemsPerPage).exec(function(err, foundBooks) {
        if (err) {
          req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
          res.redirect("/books");
        } else {
          res.render("books/index", {
            books: foundBooks,
            numPages: Math.ceil((bookCount) / itemsPerPage),
            currentPage: req.params.page_no,
          });
        }
      });
    }
  });
});

// search routes
router.get("/search", (req, res) => res.render("books/search"));

router.post("/search", (req, res) => {
  Book.find({ $text: { $search: req.body.searchTerm }}).exec(function(err, foundBooks) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect("/books");
    } else {
      res.render("books/search", {
        books: foundBooks,
        searchTerm: req.body.searchTerm
      });
    }
  });
});

// new route
// takes a book request and asks for more information from admins
// before a book is added to the database
// only admins can create a new book
router.get("/new/:request_id", middleware.checkAdmin, (req, res) => {
  BookRequest.findById(req.params.request_id, function(err, foundRequest) {
    if (err || !foundRequest) {
      req.flash("error", "This request does not exist!")
      res.redirect("/books/request/all");
    } else {
      res.render("books/new", { request: foundRequest });
    }
  });
});

// create route
// only admins can create a new book
router.post("/new/:request_id", middleware.checkAdmin, (req, res) => {
  req.body.description = req.sanitize(req.body.description);
  if (req.body.title && req.body.coverImage && req.body.author && req.body.description) {
    var newBook = {
      title: req.body.title,
      coverImage: req.body.coverImage,
      author: req.body.author,
      description: req.body.description,
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
    req.flash("error", "At least one of the fields is empty!")
    res.redirect("/books/new/" + req.params.request_id);
  }
});

// show route
router.get("/:id", (req, res) => {
  Book.findById(req.params.id).populate({
    path: "chapters",
    options: { sort: "number" },
  }).exec(function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect("/books");
    } else {
      res.render("books/show", { book: foundBook });
    }
  });
});

// edit route
router.get("/:id/edit", middleware.checkAdmin, (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect("/books");
    } else {
      res.render("books/edit", { book: foundBook });
    }
  });
});

// update route
router.put("/:id", middleware.checkAdmin, (req, res) => {
  req.body.book.description = req.sanitize(req.body.book.description);
  Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, updatedBook) {
    if (err || !updatedBook) {
      req.flash("error", "This book does not exist!");
      res.redirect("/books");
    } else {
      res.redirect("/books")
    }
  });
});

router.delete("/:id", middleware.checkAdmin, (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect("/books");
    } else {
      Chapter.remove({ book: { id: foundBook._id } }, function(err) {
        if (err) {
          console.log(err);
        } else {
          Book.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
              req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
            }
            res.redirect("/books/");
          });
        }
      });
    }
  });
});

module.exports = router;
