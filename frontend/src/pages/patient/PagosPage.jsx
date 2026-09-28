import { useEffect, useState } from "react";
import { pagosApi } from "../../api/resources";
import TablaPagos from "../../components/TablaPagos";

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
      {pagos && pagos.length > 0 && <TablaPagos pagos={pagos} />}
    </div>
  );
}
