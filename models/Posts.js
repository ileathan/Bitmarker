var mongoose = require('mongoose');
var PostsSchema = new mongoose.Schema({
  "username": String,
  "marks": Number,
  "replyto": String,
  "ismarking": String,
  "message": String,
  "date": { type: Date, default: Date.now },
}, { id: false });
module.exports = mongoose.model('Posts', PostsSchema);
