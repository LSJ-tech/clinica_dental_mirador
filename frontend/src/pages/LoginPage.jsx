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
      await login(telefono, password);
      navigate("/citas");
    } catch {
      setError("Teléfono o contraseña incorrectos.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Clínica Dental El Mirador</h1>
      <label>
        Teléfono
        <input
          type="text"
          placeholder="+56 9 1234 5678"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </label>
      <label>
        Contraseña
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
