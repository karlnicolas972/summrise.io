var mongoose = require("mongoose");

var bookRequestSchema = new mongoose.Schema({
  title: String,
  author: String,
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre"
  }],
});

module.exports = mongoose.model("BookRequest", bookRequestSchema);
