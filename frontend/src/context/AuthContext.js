import { createContext, useState } from "react";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => localStorage.getItem("user:token"));
  const login = (token) => {
    localStorage.setItem("user:token", token);
    setUser(token);
  };
  const logout = () => {
    localStorage.removeItem("user:token");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
