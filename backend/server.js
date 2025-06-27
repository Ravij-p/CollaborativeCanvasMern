const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();

dotenv.config();
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const canvasRoutes = require("./routes/canvas");
const apiRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });
app.set("io", io);
require("./utils/socketHandler")(io);

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/canvas", canvasRoutes);
app.use("/api/tools", require("./routes/api"));

server.listen(5000, () => console.log("Server running on port 5000"));
