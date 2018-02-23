var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var defaultPath = "/books/page/1/sort/-views";
var Genre = require("../models/genre");
var Book = require("../models/book");

// index route - in books index

// router.get("/", (req, res) => {
//   Genre.find({}, function(err, foundGenres) {
//     if (err) {
//       req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
//       res.redirect(defaultPath);
//     } else {
//       res.render("genres/index", { genres: foundGenres });
//     }
//   })
// });

// new route
router.get("/new", middleware.checkAdmin, (req, res) => {
  Book.find({}, function(err, foundBooks) {
    if (err) {
      req.flash("error", "Something went wrong... Please contact our administrators with information about this error.");
      res.redirect(defaultPath);
    } else {
      res.render("genres/new", { books: foundBooks });
    }
  });
});

// create route
router.post("/new", middleware.checkAdmin, (req, res) => {
  Genre.create(req.body.genre, function(err, createdGenre) {
    if (err || !createdGenre) {
      req.flash("error", "This genre couldn't be created!");
      res.redirect(defaultPath);
    } else {
      req.flash("success", `"${createdGenre.name}" added to the list of genres!`);
      console.log(createdGenre);
      res.redirect("/books/genres/new");
    }
  });
});

module.exports = router;
