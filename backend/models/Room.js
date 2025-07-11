const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
  name: String,
  owner: String,
  users: [String],
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Room", roomSchema);
