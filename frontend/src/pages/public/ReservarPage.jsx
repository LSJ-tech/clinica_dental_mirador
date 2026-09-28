import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { disponibilidadApi, profesionalesApi, reservasApi } from "../../api/resources";
import PublicNav from "./PublicNav";
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
  const [crearCuenta, setCrearCuenta] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordRepetir, setPasswordRepetir] = useState("");
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
    if (crearCuenta && password !== passwordRepetir) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    try {
      const respuesta = await reservasApi.create({
        ...datos,
        profesional,
        fecha,
        hora: horaElegida,
        crear_cuenta: crearCuenta,
        password: crearCuenta ? password : undefined,
      });
      setConfirmada(respuesta.data);
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.horario) {
        // El backend distingue esto (bajo la key "horario") de otros 400
        // sin relacion con el horario, como una contraseña invalida --
        // antes cualquier 400 mostraba este mismo mensaje, ocultando el
        // motivo real del rechazo.
        setError("Ese horario ya no está disponible. Elige otro por favor.");
        setHoraElegida(null);
        disponibilidadApi.get({ profesional, fecha }).then((r) => setSlots(r.data.slots));
      } else if (err.response?.status === 400 && err.response.data) {
        const mensaje = Object.values(err.response.data).flat().join(" ");
        setError(mensaje || "No se pudo completar la reserva. Intenta nuevamente.");
      } else {
        setError("No se pudo completar la reserva. Intenta nuevamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cs-landing">
      <PublicNav />

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
              {confirmada.cuenta_creada && (
                <p className="cs-text">
                  Tu cuenta quedó creada: ya puedes ingresar con tu RUT y tu contraseña para
                  ver tus citas, tu ficha y tus pagos.
                </p>
              )}
              <Link to="/" className="cs-link">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <div className="cs-reserva-paso">
                <label>
                  <span>Profesional</span>
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
                  <span>Fecha</span>
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

              {/* Fuera del bloque de horaElegida a proposito: si la reserva
                  falla porque el horario ya se ocupo, horaElegida vuelve a
                  null en el mismo render que fija este error -- si el
                  mensaje viviera dentro del form condicionado a horaElegida,
                  desapareceria junto con el form antes de que alguien lo viera. */}
              {error && !horaElegida && <p role="alert">{error}</p>}

              {horaElegida && (
                <form className="cs-reserva-paso" onSubmit={confirmarReserva}>
                  <label>
                    <span>Nombre completo</span>
                    <input
                      value={datos.nombre}
                      onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>RUT</span>
                    <input
                      value={datos.rut}
                      onChange={(e) => setDatos({ ...datos, rut: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>Teléfono</span>
                    <input
                      placeholder="+56 9 1234 5678"
                      value={datos.telefono}
                      onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>Motivo (opcional)</span>
                    <input
                      placeholder="Ej: limpieza, dolor de muela..."
                      value={datos.motivo}
                      onChange={(e) => setDatos({ ...datos, motivo: e.target.value })}
                    />
                  </label>

                  <label className="cs-checkbox-label">
                    <input
                      type="checkbox"
                      checked={crearCuenta}
                      onChange={(e) => setCrearCuenta(e.target.checked)}
                    />
                    <span>Quiero crear una cuenta para ver mis citas, ficha y pagos</span>
                  </label>

                  {crearCuenta && (
                    <>
                      <label>
                        <span>Contraseña</span>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        <span>Repetir contraseña</span>
                        <input
                          type="password"
                          value={passwordRepetir}
                          onChange={(e) => setPasswordRepetir(e.target.value)}
                          required
                        />
                      </label>
                    </>
                  )}

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
