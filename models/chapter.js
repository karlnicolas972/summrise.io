var mongoose = require("mongoose");

var chapterSchema = new mongoose.Schema({
  number: Number,
  title: String,
  isPublic: Boolean,
  views: Number,
  totalRating: Number,
  numRatings: Number,
  avgRating: Number,
  summary: String,
  book: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    }
  },
  author: {
		username: String,
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	},
});

module.exports = mongoose.model("Chapter", chapterSchema);
