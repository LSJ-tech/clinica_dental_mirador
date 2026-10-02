import { useEffect, useState } from "react";
import { citasApi, pacientesApi, recordatoriosApi } from "../../api/resources";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [citasHoy, setCitasHoy] = useState(null);
  const [totalPacientes, setTotalPacientes] = useState(null);
  const [error, setError] = useState("");
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);
  const [resultadoRecordatorios, setResultadoRecordatorios] = useState(null);

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

  async function handleEnviarRecordatorios() {
    setEnviandoRecordatorios(true);
    setResultadoRecordatorios(null);
    try {
      const { data } = await recordatoriosApi.enviar();
      setResultadoRecordatorios(
        `Recordatorios del ${data.fecha}: ${data.enviados} enviados, ${data.fallidos} fallidos.`
      );
    } catch {
      setResultadoRecordatorios("No se pudieron enviar los recordatorios. Intenta nuevamente.");
    } finally {
      setEnviandoRecordatorios(false);
    }
  }

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

      <section className="panel-card">
        <h2>Recordatorios de mañana</h2>
        <p>
          Manda el correo de recordatorio/reconfirmación a los pacientes con hora mañana. Esto se
          hace a mano mientras el envío automático diario no esté activado (tiene un costo
          aparte).
        </p>
        <button onClick={handleEnviarRecordatorios} disabled={enviandoRecordatorios}>
          {enviandoRecordatorios ? "Enviando..." : "Enviar recordatorios de mañana"}
        </button>
        {resultadoRecordatorios && <p role="status">{resultadoRecordatorios}</p>}
      </section>
    </div>
  );
}
