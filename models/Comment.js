var mongoose = require("mongoose");


var CommentSchema = new mongoose.Schema({
  title: String,
  body: String
});

var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;
