var mongoose = require("mongoose");

var genreSchema = new mongoose.Schema({
  name: String,
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }],
});

module.exports = mongoose.model("Genre", genreSchema);
