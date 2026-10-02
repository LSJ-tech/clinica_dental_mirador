import { useEffect, useState } from "react";
import { citasApi, pacientesApi } from "../../api/resources";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [citasHoy, setCitasHoy] = useState(null);
  const [totalPacientes, setTotalPacientes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    citasApi
      .list({ fecha: hoyISO() })
      .then((r) => setCitasHoy(r.data.length))
      .catch(() => setError("No se pudieron cargar las citas de hoy."));
    pacientesApi
      .list()
      .then((r) => setTotalPacientes(r.data.length))
      .catch(() => setError("No se pudo cargar el total de pacientes."));
  }, []);

  return (
    <div>
      <h1>Panel</h1>
      {error && <p role="alert">{error}</p>}
      <div className="tarjetas">
        <div className="tarjeta">
          <strong>{citasHoy ?? "..."}</strong>
          <span>Citas hoy</span>
        </div>
        <div className="tarjeta">
          <strong>{totalPacientes ?? "..."}</strong>
          <span>Pacientes totales</span>
        </div>
      </div>
    </div>
  );
}
