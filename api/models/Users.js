const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean
}, {
  collection: 'User' // This should match exactly the collection name in your database
});

// The first parameter here should be the singular name of the collection your model is for.
// Mongoose automatically looks for the plural version of your model name.
const User = mongoose.model('User', userSchema);

module.exports = User;
