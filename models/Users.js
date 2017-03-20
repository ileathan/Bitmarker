var mongoose = require('mongoose');
var UsersSchema = new mongoose.Schema({
  "username": String,
  "login-cookie": String,
  "password": String,
  updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Users', UsersSchema);

