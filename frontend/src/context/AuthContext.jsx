import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { meApi } from "../api/resources";

const AuthContext = createContext(null);

function sanitizarToken(valor) {
  if (typeof valor !== "string" || !valor) {
    throw new Error("Respuesta de login inválida.");
  }
  return valor;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [isStaff, setIsStaff] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    meApi
      .get()
      .then((respuesta) => {
        setIsStaff(respuesta.data.is_staff);
        setPaciente(respuesta.data.paciente);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
    // Solo al montar: si el token cambia por login/logout, esos flujos ya
    // actualizan isStaff/paciente por su cuenta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (telefono, password) => {
    const respuesta = await client.post("/token/", { username: telefono, password });
    // No guardar en localStorage lo que venga en la respuesta sin mirar:
    // solo strings no vacíos, nunca objetos/null/undefined por una
    // respuesta inesperada del backend.
    const access = sanitizarToken(respuesta.data.access);
    const refresh = sanitizarToken(respuesta.data.refresh);
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setToken(access);
    const me = await meApi.get();
    setIsStaff(me.data.is_staff);
    setPaciente(me.data.paciente);
    return me.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setIsStaff(false);
    setPaciente(null);
  }, []);

  // Sin esto, cada render de AuthProvider crea un objeto value nuevo y
  // vuelve a renderizar cada componente que consume el contexto, aunque
  // nada haya cambiado realmente.
  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, isStaff, paciente, loading, login, logout }),
    [token, isStaff, paciente, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
