import { useEffect, useState } from "react";
import { pagosApi } from "../../api/resources";

export default function PagosPage() {
  const [pagos, setPagos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    pagosApi
      .list()
      .then((respuesta) => setPagos(respuesta.data))
      .catch(() => setError("No se pudieron cargar tus pagos."));
  }, []);

  return (
    <div>
      <h1>Mis pagos</h1>
      {error && <p role="alert">{error}</p>}
      {!error && pagos === null && <p>Cargando...</p>}
      {pagos?.length === 0 && <p>No tienes pagos registrados.</p>}
      {pagos && pagos.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Medio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td>{p.fecha}</td>
                <td>${p.monto}</td>
                <td>{p.medio_pago}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
