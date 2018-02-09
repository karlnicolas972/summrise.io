var mongoose = require("mongoose");

var bookRequestSchema = new mongoose.Schema({
  title: String,
  author: String,
});

module.exports = mongoose.model("BookRequest", bookRequestSchema);
