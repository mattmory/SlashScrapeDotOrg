var mongoose = require("mongoose");

var StorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  saved: Boolean,
  preview: String,
  scraptedAt: {
    type: Date,
    default: Date.now
  }
});
var Story = mongoose.model("Story", StorySchema);


// Export the Story model
module.exports = Story;