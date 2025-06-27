module.exports = (io) => {
  const users = {}; // socket.id -> { roomId, username }
  const roomUsers = {}; // roomId -> Set of usernames
  const roomOwners = {}; // roomId -> owner username

  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);
      users[socket.id] = { roomId, username };

      // ✅ Assign owner
      if (!roomOwners[roomId]) {
        roomOwners[roomId] = username;
      }

      if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
      roomUsers[roomId].add(username);

      io.to(roomId).emit("user-list", Array.from(roomUsers[roomId]));
    });

    socket.on("draw", (data) => {
      const roomId = users[socket.id]?.roomId;
      socket.to(roomId).emit("draw", data);
    });

    socket.on("pdf-uploaded", ({ roomId, url }) => {
      socket.to(roomId).emit("pdf-received", { url });
    });
    socket.on("tool-output", (text) => {
      const roomId = users[socket.id]?.roomId;
      socket.to(roomId).emit("tool-output", text);
    });

    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        const { roomId, username } = user;
        socket.to(roomId).emit("user-left", username);

        // ✅ Notify if room owner disconnects
        if (username === roomOwners[roomId]) {
          io.to(roomId).emit("room-closed");
          delete roomOwners[roomId];
        }

        delete users[socket.id];
      }
    });
  });
};
