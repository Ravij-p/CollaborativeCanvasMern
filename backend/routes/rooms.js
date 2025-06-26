const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createRoom,
  joinRoom,
  leaveRoom,
} = require("../controllers/roomController");
router.get("/", auth, async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});
router.post("/create", auth, createRoom);
router.post("/:id/join", auth, joinRoom);
router.post("/:id/leave", auth, leaveRoom);
module.exports = router;
