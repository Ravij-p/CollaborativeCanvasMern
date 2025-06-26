import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  return (
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <h1>CollabCanvas</h1>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
