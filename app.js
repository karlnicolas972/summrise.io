// reqs
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Book = require("./models/book");
var methodOverride = require("method-override");
// var flash = require("connect-flash");
var port = process.env.PORT || 9720;
var databaseURL = process.env.DATABASEURL || "mongodb://localhost/summrise";

// routes
var indexRoutes = require("./routes/index");
var bookRoutes = require("./routes/books");
var bookRequestRoutes = require("./routes/requests");

// app config
mongoose.connect(databaseURL);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// app.use(flash());

// global middleware
// app.use(function(req, res, next) {
//   res.locals.error = req.flash("error");
//   res.locals.success = req.flash("success");
//   next();
// });

app.use(indexRoutes);
app.use("/books/request", bookRequestRoutes);
app.use("/books", bookRoutes);

app.listen(port, () => console.log("summrise.io server active at port " + port));
