const Room = require("../models/Room");
exports.createRoom = async (req, res) => {
  const room = await Room.create({
    name: req.body.name,
    owner: req.user.username,
    users: [req.user.username],
  });
  res.json(room);
};
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.users.includes(req.user.username)) {
      room.users.push(req.user.username);
      await room.save();
    }

    res.json(room);
  } catch (error) {
    console.error("Join Room Error:", error);
    res.status(500).json({ message: "Join failed" });
  }
};
exports.uploadPDF = async (req, res) => {
  try {
    const fileUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary
    const roomId = req.body.roomId;

    // Emit via socket to all in room
    req.app.get("io").to(roomId).emit("pdf-received", { url: fileUrl });

    res.json({ url: fileUrl });
  } catch (error) {
    console.error("PDF Upload Failed:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.users = room.users.filter((u) => u !== req.user.username);

    if (room.owner === req.user.username || room.users.length === 0) {
      await Room.findByIdAndDelete(req.params.id);
      return res.json({ deleted: true });
    }

    await room.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Leave Room Error:", err);
    res.status(500).json({ message: "Failed to leave room" });
  }
};
