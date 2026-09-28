import { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  async function login(telefono, password) {
    const respuesta = await client.post("/token/", { username: telefono, password });
    localStorage.setItem("access_token", respuesta.data.access);
    localStorage.setItem("refresh_token", respuesta.data.refresh);
    setToken(respuesta.data.access);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
