var mongoose = require('mongoose');
var PostsSchema = new mongoose.Schema({
  "username": String,
  "reputation": Number,
  "marks": Number,
  "post": String,
  "date": { type: Date, default: Date.now },
}, { id: false });
module.exports = mongoose.model('Posts', PostsSchema);
