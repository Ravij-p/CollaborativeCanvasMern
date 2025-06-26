module.exports = (io) => {
  const users = {}; // socket.id -> { roomId, username }
  const roomUsers = {}; // roomId -> Set of usernames

  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);
      users[socket.id] = { roomId, username };

      if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
      roomUsers[roomId].add(username);

      io.to(roomId).emit("user-list", Array.from(roomUsers[roomId]));
    });

    socket.on("draw", (data) => {
      const roomId = users[socket.id]?.roomId;
      socket.to(roomId).emit("draw", data);
    });
    socket.on("pdf-uploaded", ({ buffer }) => {
      const user = users[socket.id];
      if (!user || !user.roomId) return;
      socket.to(user.roomId).emit("pdf-uploaded", { buffer });
    });

    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        const { roomId, username } = user;
        roomUsers[roomId]?.delete(username);

        if (roomUsers[roomId]?.size === 0) delete roomUsers[roomId];

        io.to(roomId).emit("user-list", Array.from(roomUsers[roomId] || []));
        delete users[socket.id];
      }
    });
  });
};
