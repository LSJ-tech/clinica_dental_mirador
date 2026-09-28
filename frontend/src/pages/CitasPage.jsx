import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CitasPage() {
  const [citas, setCitas] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    client
      .get("/citas/")
      .then((respuesta) => setCitas(respuesta.data))
      .catch(() => setError("No se pudieron cargar tus citas."));
  }, []);

  return (
    <div>
      <h1>Mis citas</h1>
      <button onClick={logout}>Cerrar sesión</button>
      {error && <p role="alert">{error}</p>}
      {!error && citas === null && <p>Cargando...</p>}
      {citas?.length === 0 && <p>No tienes citas registradas.</p>}
      {citas && citas.length > 0 && (
        <ul>
          {citas.map((cita) => (
            <li key={cita.id}>
              {cita.fecha} {cita.hora} — {cita.estado}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
