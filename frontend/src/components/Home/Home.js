import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const Home = () => {
  const [roomName, setRoomName] = useState("");
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const res = await api.post("/rooms/create", { name: roomName });
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      alert("Failed to create room");
    }
  };

  const joinRoom = async () => {
    if (!roomIdToJoin.trim()) {
      alert("Please enter a valid Room ID.");
      return;
    }

    try {
      const res = await api.post(`/rooms/${roomIdToJoin}/join`);
      navigate(`/room/${roomIdToJoin}`);
    } catch (err) {
      console.error("Join Room Error:", err.response?.data || err.message);
      alert("Failed to join room.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Collab Canvas</h2>

      {/* Create Room */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create Room</h3>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={createRoom}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          ➕ Create Room
        </button>
      </div>

      {/* Join Room */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Join Room</h3>
        <input
          type="text"
          value={roomIdToJoin}
          onChange={(e) => setRoomIdToJoin(e.target.value)}
          placeholder="Enter Room ID"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={joinRoom}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          🔗 Join Room
        </button>
      </div>
    </div>
  );
};

export default Home;
