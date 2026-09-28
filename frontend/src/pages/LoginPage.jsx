import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const me = await login(telefono, password);
      navigate(me.is_staff ? "/staff" : "/citas");
    } catch {
      setError("Teléfono o contraseña incorrectos.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Clínica Dental El Mirador</h1>
      <label>
        <span>Teléfono</span>
        <input
          type="text"
          placeholder="+56 9 1234 5678"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
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
  );
}
