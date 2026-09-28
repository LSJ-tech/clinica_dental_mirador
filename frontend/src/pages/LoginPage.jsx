import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicNav from "./public/PublicNav";
import "./public/landing.css";

export default function LoginPage() {
  const [modo, setModo] = useState("paciente");
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setIdentificador("");
    setPassword("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const me = await login(identificador, password);
      navigate(me.is_staff ? "/staff" : "/citas");
    } catch {
      setError(
        modo === "paciente"
          ? "Teléfono o contraseña incorrectos."
          : "Usuario o contraseña incorrectos."
      );
    }
  }

  return (
    <div className="cs-landing">
      <PublicNav />

      <section>
        <div className="cs-container cs-login-card">
          <span className="cs-topper">Acceso</span>
          <h2 className="cs-title">Ingresa a tu cuenta</h2>
          <p className="cs-text">
            Revisa tus citas, tu ficha y tus pagos, o entra al panel del equipo.
          </p>

          <div className="cs-login-tabs">
            <button
              type="button"
              className={modo === "paciente" ? "activo" : ""}
              onClick={() => cambiarModo("paciente")}
            >
              Soy paciente
            </button>
            <button
              type="button"
              className={modo === "staff" ? "activo" : ""}
              onClick={() => cambiarModo("staff")}
            >
              Staff
            </button>
          </div>

          <form className="cs-reserva-paso cs-login-form" onSubmit={handleSubmit}>
            <label>
              <span>{modo === "paciente" ? "Teléfono" : "Usuario"}</span>
              <input
                type="text"
                placeholder={modo === "paciente" ? "+56 9 1234 5678" : undefined}
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button type="submit" className="cs-link">
              Ingresar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
