import { useEffect, useState } from "react";
import { citasApi } from "../../api/resources";
import Badge from "../../components/Badge";

export default function CitasPage() {
  const [citas, setCitas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    citasApi
      .list()
      .then((respuesta) => setCitas(respuesta.data))
      .catch(() => setError("No se pudieron cargar tus citas."));
  }, []);

  return (
    <div>
      <h1>Mis citas</h1>
      {error && <p role="alert">{error}</p>}
      {!error && citas === null && <p>Cargando...</p>}
      {citas?.length === 0 && <p>No tienes citas registradas.</p>}
      {citas && citas.length > 0 && (
        <section className="panel-card">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Profesional</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.fecha}</td>
                <td>{cita.hora}</td>
                <td>{cita.profesional_nombre}</td>
                <td>
                  <Badge estado={cita.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </section>
      )}
    </div>
  );
}
