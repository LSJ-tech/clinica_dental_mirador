import { useEffect, useState } from "react";
import { fichasClinicasApi, tratamientosApi } from "../../api/resources";

export default function FichaClinicaPage() {
  const [ficha, setFicha] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fichasClinicasApi
      .list()
      .then((respuesta) => {
        const propia = respuesta.data[0] ?? null;
        setFicha(propia);
        if (propia) {
          return tratamientosApi.list({ ficha_clinica: propia.id });
        }
        return null;
      })
      .then((respuesta) => {
        if (respuesta) setTratamientos(respuesta.data);
      })
      .catch(() => setError("No se pudo cargar tu ficha clínica."));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!ficha) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Mi ficha clínica</h1>
      <section>
        <h2>Historial</h2>
        <p>{ficha.historial || "Sin registros todavía."}</p>
      </section>
      <section>
        <h2>Notas clínicas</h2>
        <p>{ficha.notas_clinicas || "Sin notas todavía."}</p>
      </section>
      <section>
        <h2>Tratamientos</h2>
        {tratamientos.length === 0 && <p>No tienes tratamientos registrados.</p>}
        {tratamientos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Costo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tratamientos.map((t) => (
                <tr key={t.id}>
                  <td>{t.tipo}</td>
                  <td>${t.costo}</td>
                  <td>{t.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
