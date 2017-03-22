var mongoose = require('mongoose');
var RepliesSchema = new mongoose.Schema({
  "username": String,
  "marks": Number,
  "post": String,
  "replyto": String,
  "date": { type: Date, default: Date.now },
});
module.exports = mongoose.model('Replies', RepliesSchema);


