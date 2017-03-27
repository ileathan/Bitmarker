var mongoose = require('mongoose');
var UsersSchema = new mongoose.Schema({
  "username": String,
  "login-cookie": String,
  "password": String,
  "wallet": String,
  "balance": Number,
  "reputation": Number,
  updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Users', UsersSchema);

