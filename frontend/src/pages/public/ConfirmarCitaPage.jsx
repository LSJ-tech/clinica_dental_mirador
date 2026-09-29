import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmarCitaApi } from "../../api/resources";
import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";
import "./landing.css";

const ESTADO_TEXTO = {
  confirmada: "¡Listo! Tu hora quedó confirmada.",
  pendiente: "Tu hora sigue pendiente de confirmación por nuestro equipo.",
  cancelada: "Esta hora ya fue cancelada.",
  completada: "Esta hora ya fue atendida.",
  no_asistio: "Esta hora quedó registrada como no asistida.",
};

export default function ConfirmarCitaPage() {
  const { token } = useParams();
  const [cita, setCita] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    confirmarCitaApi
      .get(token)
      .then((r) => setCita(r.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "No se pudo confirmar la hora.");
      });
  }, [token]);

  return (
    <div className="cs-landing">
      <PublicNav />

      <section>
        <div className="cs-container">
          <span className="cs-topper">Reconfirmación de hora</span>
          <h2 className="cs-title">Tu cita</h2>

          {error && <p role="alert">{error}</p>}

          {!error && !cita && <p className="cs-text">Confirmando...</p>}

          {cita && (
            <div className="cs-reserva-confirmacion">
              <p className="cs-text">{ESTADO_TEXTO[cita.estado] || "Tu hora fue actualizada."}</p>
              <p className="cs-text">
                <strong>{cita.fecha}</strong> a las <strong>{cita.hora?.slice(0, 5)}</strong> con{" "}
                <strong>{cita.profesional_nombre}</strong>.
              </p>
              <Link to="/" className="cs-link">
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
