import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pacientesApi } from "../../api/resources";

const VACIO = { nombre: "", rut: "", telefono: "", fecha_nacimiento: "" };

export default function PacientesListPage() {
  const [pacientes, setPacientes] = useState([]);
  const [q, setQ] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function buscar(query) {
    pacientesApi
      .list(query ? { q: query } : undefined)
      .then((r) => setPacientes(r.data))
      .catch(() => setError("No se pudieron cargar los pacientes."));
  }

  useEffect(() => buscar(""), []);

  function handleBuscarSubmit(e) {
    e.preventDefault();
    buscar(q);
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError("");
    try {
      const respuesta = await pacientesApi.create(form);
      void navigate(`/staff/pacientes/${respuesta.data.id}`);
    } catch {
      setError("No se pudo crear el paciente (revisa que el RUT no esté repetido).");
    }
  }

  return (
    <div>
      <h1>Pacientes</h1>
      <section className="panel-card">
      <form className="form-inline" onSubmit={handleBuscarSubmit}>
        <input
          placeholder="Buscar por nombre, RUT o teléfono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/staff/pacientes/${p.id}`}>{p.nombre}</Link>
              </td>
              <td>{p.rut}</td>
              <td>{p.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </section>

      <section className="panel-card">
      <button onClick={() => setMostrarForm(!mostrarForm)}>
        {mostrarForm ? "Cancelar" : "Nuevo paciente"}
      </button>

      {mostrarForm && (
        <form onSubmit={handleCrear}>
          <label>
            <span>Nombre</span>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </label>
          <label>
            <span>RUT</span>
            <input
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              required
            />
          </label>
          <label>
            <span>Teléfono</span>
            <input
              placeholder="+56 9 1234 5678"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              required
            />
          </label>
          <label>
            <span>Fecha de nacimiento</span>
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button type="submit">Crear</button>
        </form>
      )}
      </section>
    </div>
  );
}
