// reqs
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Book = require("./models/book");
var port = process.env.PORT || 9720;
var databaseURL = process.env.DATABASEURL || "mongodb://localhost/summrise";

// routes
var indexRoutes = require("./routes/index");
var bookRoutes = require("./routes/books");

// app config
mongoose.connect(databaseURL);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(indexRoutes);
app.use("/books", bookRoutes);

app.listen(port, () => console.log("summrise.io server active at port " + port));
