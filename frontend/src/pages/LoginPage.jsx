import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div>
      <h1>Clínica Dental El Mirador</h1>
      <nav className="tabs">
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
          Soy del equipo
        </button>
      </nav>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
