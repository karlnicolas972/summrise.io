var express = require("express");
var app = express();
var port = process.env.PORT || 9720;

// routes
var indexRoutes = require("./routes/index");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(indexRoutes);

app.listen(port, () => console.log("summrise.io server active at port " + port));
