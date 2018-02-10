var mongoose = require("mongoose");

var chapterSchema = new mongoose.Schema({
  number: Number,
  title: String,
  summary: String,
  book: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    }
  }
});

module.exports = mongoose.model("Chapter", chapterSchema);
