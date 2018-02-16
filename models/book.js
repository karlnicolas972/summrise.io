var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
  title: String,
  coverImage: String, // meant to be a url to the image
  author: String,
  description: String,
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }]
});

bookSchema.index({ title: "text", author: "text", description: "text" });

module.exports = mongoose.model("Book", bookSchema);
