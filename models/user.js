const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

// User schema containing only custom fields we want to store
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Passport-Local-Mongoose plugin automatically:
// - Adds username field
// - Adds hash and salt fields for password storage
// - Adds methods like User.register(), User.authenticate()
// - Adds serializeUser() and deserializeUser() helpers for Passport
// - Handles password hashing and validation internally
userSchema.plugin(passportLocalMongoose.default); // means :-
// Modify userSchema by adding
// Passport authentication features.

// plugin():-
// plugin() is a Mongoose method that lets you attach reusable functionality to a schema.

// Create and export User model
module.exports = mongoose.model("User", userSchema);

// One thing to note: Passport-Local-Mongoose does not add a password field. Instead it stores:
// username
// hash
// salt
