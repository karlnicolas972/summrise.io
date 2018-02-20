var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  views: Number,
  totalRating: Number,
  numRatings: Number,
  avgRating: Number,
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }]
});

bookSchema.index({ title: "text", author: "text", description: "text" });

module.exports = mongoose.model("Book", bookSchema);
