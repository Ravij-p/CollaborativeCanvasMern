import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  const fetchRooms = async () => {
    const res = await api.get("/rooms"); // Optionally implement this if needed
    setRooms(res.data);
  };

  const createRoom = async () => {
    try {
      const res = await api.post("/rooms/create", { name: roomName });
      navigate(`/room/${res.data._id}`); // 👈 route to the canvas
    } catch (err) {
      alert("Room creation failed");
    }
  };

  const joinRoom = (id) => {
    navigate(`/room/${id}`);
  };

  return (
    <div>
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
      />
      <button onClick={createRoom}>Create</button>

      <h2 className="mt-4 font-bold">Available Rooms:</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room._id} className="flex justify-between">
            <span>{room.name}</span>
            <button onClick={() => joinRoom(room._id)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;
