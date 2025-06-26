import React, { useEffect, useState } from "react";
import socket from "../../utils/socketClient";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("user-list", setUsers);
    return () => socket.off("user-list");
  }, []);

  return (
    <ul className="mt-4">
      <h3 className="font-semibold">Active Users:</h3>
      {users.map((u, i) => (
        <li key={i}>👤 {u}</li>
      ))}
    </ul>
  );
};

export default UserList;
