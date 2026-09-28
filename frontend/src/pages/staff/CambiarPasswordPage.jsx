import { useState } from "react";
import { cuentaApi } from "../../api/resources";

const VACIO = { password_actual: "", password_nueva: "", password_nueva_repetir: "" };

export default function CambiarPasswordPage() {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito(false);

    if (form.password_nueva !== form.password_nueva_repetir) {
      setError("Las dos claves nuevas no coinciden.");
      return;
    }

    try {
      await cuentaApi.cambiarPassword({
        password_actual: form.password_actual,
        password_nueva: form.password_nueva,
      });
      setExito(true);
      setForm(VACIO);
    } catch (err) {
      const detalle =
        err.response?.data?.password_actual?.[0] ||
        err.response?.data?.password_nueva?.[0] ||
        "No se pudo cambiar la contraseña.";
      setError(detalle);
    }
  }

  return (
    <div>
      <h1>Cambiar contraseña</h1>
      <section className="panel-card">
      <form onSubmit={handleSubmit}>
        <label>
          <span>Contraseña actual</span>
          <input
            type="password"
            value={form.password_actual}
            onChange={(e) => setForm({ ...form, password_actual: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Contraseña nueva</span>
          <input
            type="password"
            value={form.password_nueva}
            onChange={(e) => setForm({ ...form, password_nueva: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Repetir contraseña nueva</span>
          <input
            type="password"
            value={form.password_nueva_repetir}
            onChange={(e) => setForm({ ...form, password_nueva_repetir: e.target.value })}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        {exito && <p>Contraseña actualizada correctamente.</p>}
        <button type="submit">Guardar</button>
      </form>
      </section>
    </div>
  );
}
