var express = require("express");
var router = express.Router({ mergeParams: true });
var Book = require("../models/book");
var Chapter = require("../models/chapter");
var middleware = require("../middleware");

// index route - show page for a book

// new route
router.get("/new", middleware.isLoggedIn, (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      req.flash("error", "This book does not exist!");
      res.redirect("/books");
    } else {
      res.render("chapters/new", { book: foundBook });
    }
  });
});

// create route
router.post("/", middleware.isLoggedIn, (req, res) => {
  var newChapter = {
    number: req.body.number,
    title: req.body.title,
    summary: req.body.summary,
    book: {
      id: req.params.id
    }
  };
  Chapter.create(newChapter, function(err, createdChapter) {
    if (err || !createdChapter) {
      req.flash("error", "This chapter couldn't be created. Please re-enter the contents of the chapter summary.")
      res.redirect(`/books/${req.params.id}/chapters/new`);
    } else {
      Book.findById(req.params.id, function(err, foundBook) {
        if (err || !foundBook) {
          req.flash("error", "This book does not exist!");
          res.redirect(`/books/${req.params.id}/chapters/new`);
        } else {
          createdChapter.author.id = req.user._id;
          createdChapter.author.username = req.user.username;
          createdChapter.save();
          foundBook.chapters.push(createdChapter._id);
          foundBook.save();
          res.redirect("/books/" + req.params.id);
        }
      });
    }
  });
});

// edit route
router.get("/:chapter_id/edit", middleware.checkChapterOwnership, (req, res) => {
  Chapter.findById(req.params.chapter_id, function(err, foundChapter) {
    if (err || !foundChapter) {
      req.flash("error", "This chapter does not exist!")
      res.redirect("/books/" + req.params.id);
    } else {
      res.render("chapters/edit", {
        chapter: foundChapter,
        book_id: req.params.id
      });
    }
  });
});


// update route
router.put("/:chapter_id", middleware.checkChapterOwnership, (req, res) => {
  Chapter.findByIdAndUpdate(req.params.chapter_id, req.body.chapter, function(err, updatedChapter) {
    if (err || !updatedChapter) {
      req.flash("error", "This chapter does not exist!")
    }
    res.redirect("/books/" + req.params.id);
  });
});

// delete route
router.delete("/:chapter_id", middleware.checkChapterOwnership, (req, res) => {
  Chapter.findByIdAndRemove(req.params.chapter_id, function(err) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect("/books/" + req.params.id);
    } else {
      // delete chapter from the book's chapters array
      Book.findById(req.params.id, function(err, foundBook) {
        if (err || !foundBook) {
          req.flash("error", "This book does not exist!");
          res.redirect("/books/" + req.params.id);
        } else {
          var indexToBeDeleted = foundBook.chapters.indexOf(req.params.chapter_id);
          foundBook.chapters.splice(indexToBeDeleted, 1);
          foundBook.save();
          res.redirect("/books/" + req.params.id);
        }
      });
    }
  });
});


module.exports = router;
