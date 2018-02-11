var express = require("express");
var router = express.Router({ mergeParams: true });
var Book = require("../models/book");
var Chapter = require("../models/chapter");

// index route - show page for a book

// new route
router.get("/new", (req, res) => {
  Book.findById(req.params.id, function(err, foundBook) {
    if (err || !foundBook) {
      console.log(err);
      res.redirect("/books");
    } else {
      res.render("chapters/new", { book: foundBook });
    }
  });
});

// create route
router.post("/", (req, res) => {
  var newChapter = {
    number: req.body.number,
    title: req.body.title,
    summary: req.body.summary,
    book: {
      id: req.params.id
    }
  };
  Chapter.create(newChapter, function(err, createdChapter) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      Book.findById(req.params.id, function(err, foundBook) {
        if (err || !foundBook) {
          console.log(err);
          res.redirect("back");
        } else {
          foundBook.chapters.push(createdChapter._id);
          foundBook.save();
          res.redirect("/books/" + req.params.id);
        }
      });
    }
  });
});

// edit route
router.get("/:chapter_id/edit", (req, res) => {
  Chapter.findById(req.params.chapter_id, function(err, foundChapter) {
    if (err || !foundChapter) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("chapters/edit", {
        chapter: foundChapter,
        book_id: req.params.id
      });
    }
  });
});


// update route
router.put("/:chapter_id", (req, res) => {
  Chapter.findByIdAndUpdate(req.params.chapter_id, req.body.chapter, function(err, updatedChapter) {
    if (err || !updatedChapter) {
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/books/" + req.params.id);
    }
  });
});

// delete route
router.delete("/:chapter_id", (req, res) => {
  Chapter.findByIdAndRemove(req.params.chapter_id, function(err) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/books/" + req.params.id);
    }
  })
})


module.exports = router;
