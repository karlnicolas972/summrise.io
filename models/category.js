var mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
  name: String,
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }],
});

module.exports = mongoose.model("Category", categorySchema);
