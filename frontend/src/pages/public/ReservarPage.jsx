import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { disponibilidadApi, profesionalesApi, reservasApi } from "../../api/resources";
import "./landing.css";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const DATOS_VACIOS = { nombre: "", rut: "", telefono: "", motivo: "" };

export default function ReservarPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [profesional, setProfesional] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [slots, setSlots] = useState(null);
  const [horaElegida, setHoraElegida] = useState(null);
  const [datos, setDatos] = useState(DATOS_VACIOS);
  const [error, setError] = useState("");
  const [confirmada, setConfirmada] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    profesionalesApi.list().then((r) => setProfesionales(r.data));
  }, []);

  useEffect(() => {
    setHoraElegida(null);
    setSlots(null);
    if (!profesional || !fecha) return;
    disponibilidadApi
      .get({ profesional, fecha })
      .then((r) => setSlots(r.data.slots))
      .catch(() => setError("No se pudo cargar la disponibilidad."));
  }, [profesional, fecha]);

  async function confirmarReserva(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const respuesta = await reservasApi.create({
        ...datos,
        profesional,
        fecha,
        hora: horaElegida,
      });
      setConfirmada(respuesta.data);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          "Ese horario ya no está disponible. Elige otro por favor."
        );
        setHoraElegida(null);
        disponibilidadApi.get({ profesional, fecha }).then((r) => setSlots(r.data.slots));
      } else {
        setError("No se pudo completar la reserva. Intenta nuevamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cs-landing">
      <nav className="cs-landing-nav">
        <Link to="/">
          <img
            className="cs-logo"
            src="https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/3-traansparente.png"
            alt="Clínica Dental El Mirador"
          />
        </Link>
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
        </ul>
        <Link to="/login" className="cs-button-outline">
          Ingresar
        </Link>
      </nav>

      <section>
        <div className="cs-container">
          <span className="cs-topper">Reserva tu hora</span>
          <h2 className="cs-title">Agenda tu cita en un par de pasos</h2>

          {confirmada ? (
            <div className="cs-reserva-confirmacion">
              <p className="cs-text">
                ¡Listo! Tu hora para el <strong>{confirmada.fecha}</strong> a las{" "}
                <strong>{confirmada.hora?.slice(0, 5)}</strong> quedó registrada como{" "}
                <strong>pendiente</strong>. La clínica te va a contactar para confirmarla.
              </p>
              <Link to="/" className="cs-link">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <div className="cs-reserva-paso">
                <label>
                  Profesional
                  <select value={profesional} onChange={(e) => setProfesional(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {profesionales.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — {p.especialidad}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Fecha
                  <input
                    type="date"
                    min={hoyISO()}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </label>
              </div>

              {profesional && fecha && (
                <div className="cs-reserva-paso">
                  <p className="cs-text" style={{ marginBottom: 8 }}>
                    Horas disponibles
                  </p>
                  {slots === null && <p>Cargando...</p>}
                  {slots?.length === 0 && (
                    <p>No hay horas disponibles ese día. Prueba con otra fecha.</p>
                  )}
                  {slots?.length > 0 && (
                    <div className="cs-slots-grid">
                      {slots.map((hora) => (
                        <button
                          key={hora}
                          type="button"
                          className={hora === horaElegida ? "cs-slot cs-slot-activo" : "cs-slot"}
                          onClick={() => setHoraElegida(hora)}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {horaElegida && (
                <form className="cs-reserva-paso" onSubmit={confirmarReserva}>
                  <label>
                    Nombre completo
                    <input
                      value={datos.nombre}
                      onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    RUT
                    <input
                      value={datos.rut}
                      onChange={(e) => setDatos({ ...datos, rut: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      placeholder="+56 9 1234 5678"
                      value={datos.telefono}
                      onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Motivo (opcional)
                    <input
                      placeholder="Ej: limpieza, dolor de muela..."
                      value={datos.motivo}
                      onChange={(e) => setDatos({ ...datos, motivo: e.target.value })}
                    />
                  </label>
                  {error && <p role="alert">{error}</p>}
                  <button type="submit" className="cs-link" disabled={enviando}>
                    {enviando ? "Enviando..." : `Confirmar hora de las ${horaElegida}`}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="cs-landing-footer">
        <div className="cs-container">
          <img
            className="cs-logo-footer"
            src="https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/logo_pie.png"
            alt="Clínica Dental El Mirador"
          />
          <div className="cs-footer-info">
            <span>El Mirador #459 (Sitio 17-E), Casablanca</span>
            <span>+569 5604 3960 · clinicadentalelmirador2020@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
