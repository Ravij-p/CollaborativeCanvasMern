const mongoose = require("mongoose");
const canvasSchema = new mongoose.Schema({
  roomId: String,
  data: Object,
});
module.exports = mongoose.model("Canvas", canvasSchema);
