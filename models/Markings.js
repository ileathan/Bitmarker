var mongoose = require('mongoose');
var MarkingsSchema = new mongoose.Schema({
  "marker": String,
  "marked": String,
  "reason": String,
  "reputation": Number,
  "date": { type: Date, default: Date.now }
});
module.exports = mongoose.model('Markings', MarkingsSchema);

