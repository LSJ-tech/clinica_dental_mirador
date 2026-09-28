import { useEffect, useState } from "react";
import { citasApi, pacientesApi, profesionalesApi } from "../../api/resources";
import CampoProfesional from "../../components/CampoProfesional";
import CampoHora from "../../components/CampoHora";
import Badge from "../../components/Badge";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const VACIO = { paciente: "", profesional: "", hora: "", box: "" };

export default function AgendaPage() {
  const [fecha, setFecha] = useState(hoyISO());
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");

  function cargarCitas() {
    citasApi.list({ fecha }).then((r) => setCitas(r.data));
  }

  useEffect(() => {
    pacientesApi.list().then((r) => setPacientes(r.data));
    profesionalesApi.list().then((r) => setProfesionales(r.data));
  }, []);

  useEffect(cargarCitas, [fecha]);

  async function cambiarEstado(cita, estado) {
    await citasApi.update(cita.id, { estado });
    cargarCitas();
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError("");
    try {
      await citasApi.create({ ...form, fecha, estado: "pendiente" });
      setForm(VACIO);
      cargarCitas();
    } catch {
      setError("No se pudo crear la cita (revisa que no choque con otra hora).");
    }
  }

  return (
    <div>
      <h1>Agenda</h1>
      <section className="panel-card">
        <label>
          <span>Fecha</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>

        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Profesional</th>
              <th>Box</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.hora}</td>
                <td>{cita.paciente_nombre}</td>
                <td>{cita.profesional_nombre}</td>
                <td>{cita.box}</td>
                <td>
                  <Badge estado={cita.estado} />
                </td>
                <td className="acciones">
                  <button onClick={() => cambiarEstado(cita, "confirmada")}>Confirmar</button>
                  <button onClick={() => cambiarEstado(cita, "completada")}>Completar</button>
                  <button onClick={() => cambiarEstado(cita, "no_asistio")}>No asistió</button>
                  <button onClick={() => cambiarEstado(cita, "cancelada")}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel-card">
        <h2>Agendar hora</h2>
        <form onSubmit={handleCrear}>
        <label>
          <span>Paciente</span>
          <select
            value={form.paciente}
            onChange={(e) => setForm({ ...form, paciente: e.target.value })}
            required
          >
            <option value="">Seleccionar...</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <CampoProfesional
          value={form.profesional}
          onChange={(e) => setForm({ ...form, profesional: e.target.value })}
          profesionales={profesionales}
        />
        <CampoHora
          value={form.hora}
          onChange={(e) => setForm({ ...form, hora: e.target.value })}
        />
        <label>
          <span>Box</span>
          <input value={form.box} onChange={(e) => setForm({ ...form, box: e.target.value })} />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Agendar</button>
      </form>
      </section>
    </div>
  );
}
