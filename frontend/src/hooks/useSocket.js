import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (roomId, username) => {
  const socketRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [userColor] = useState(() => {
    const colors = ["#ff0000", "#00cc66", "#0066ff", "#ff6600", "#9900cc"];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  useEffect(() => {
    if (!roomId || !username) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", { roomId, username, color: userColor });
      setReady(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username, userColor]);

  return ready ? socketRef.current : null;
};

export default useSocket;
