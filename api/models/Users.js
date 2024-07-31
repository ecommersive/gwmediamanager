const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean,
  userCompany: String
}, {
  collection: 'User' 
});


const User = mongoose.model('User', userSchema);

module.exports = User;
