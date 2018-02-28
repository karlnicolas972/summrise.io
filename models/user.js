var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: String,
	email: String,
	isAdmin: Boolean,
	password: String,
	favouriteBooks: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Book"
	}],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
