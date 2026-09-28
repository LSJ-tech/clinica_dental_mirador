import { Fragment, useEffect, useState } from "react";
import { horariosProfesionalApi, profesionalesApi } from "../../api/resources";

const VACIO = { nombre: "", especialidad: "", box_asignado: "" };

const DIAS = [
  { valor: 0, nombre: "Lunes" },
  { valor: 1, nombre: "Martes" },
  { valor: 2, nombre: "Miércoles" },
  { valor: 3, nombre: "Jueves" },
  { valor: 4, nombre: "Viernes" },
  { valor: 5, nombre: "Sábado" },
  { valor: 6, nombre: "Domingo" },
];

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [horarioAbiertoId, setHorarioAbiertoId] = useState(null);
  const [error, setError] = useState("");

  function cargar() {
    profesionalesApi.list().then((r) => setProfesionales(r.data));
  }

  useEffect(cargar, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editandoId) {
        await profesionalesApi.update(editandoId, form);
      } else {
        await profesionalesApi.create(form);
      }
      setForm(VACIO);
      setEditandoId(null);
      cargar();
    } catch {
      setError("No se pudo guardar el profesional.");
    }
  }

  function editar(profesional) {
    setEditandoId(profesional.id);
    setForm({
      nombre: profesional.nombre,
      especialidad: profesional.especialidad,
      box_asignado: profesional.box_asignado,
    });
  }

  async function eliminar(id) {
    await profesionalesApi.remove(id);
    cargar();
  }

  return (
    <div>
      <h1>Profesionales</h1>
      <section className="panel-card">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Box</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {profesionales.map((p) => (
            <Fragment key={p.id}>
              <tr>
                <td>{p.nombre}</td>
                <td>{p.especialidad}</td>
                <td>{p.box_asignado}</td>
                <td>
                  <button onClick={() => editar(p)}>Editar</button>
                  <button onClick={() => eliminar(p.id)}>Eliminar</button>
                  <button
                    onClick={() => setHorarioAbiertoId(horarioAbiertoId === p.id ? null : p.id)}
                  >
                    {horarioAbiertoId === p.id ? "Ocultar horario" : "Horario"}
                  </button>
                </td>
              </tr>
              {horarioAbiertoId === p.id && (
                <tr>
                  <td colSpan={4}>
                    <EditorHorario profesionalId={p.id} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      </section>

      <section className="panel-card">
      <h2>{editandoId ? "Editar profesional" : "Nuevo profesional"}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Nombre</span>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Especialidad</span>
          <input
            value={form.especialidad}
            onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Box asignado</span>
          <input
            value={form.box_asignado}
            onChange={(e) => setForm({ ...form, box_asignado: e.target.value })}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Guardar</button>
        {editandoId && (
          <button
            type="button"
            onClick={() => {
              setEditandoId(null);
              setForm(VACIO);
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      </section>
    </div>
  );
}

function EditorHorario({ profesionalId }) {
  const [horarios, setHorarios] = useState(null);

  function cargar() {
    horariosProfesionalApi.list({ profesional: profesionalId }).then((r) => setHorarios(r.data));
  }

  useEffect(cargar, [profesionalId]);

  function horarioDelDia(dia) {
    return horarios?.find((h) => h.dia_semana === dia) ?? null;
  }

  async function abrirDia(dia) {
    await horariosProfesionalApi.create({
      profesional: profesionalId,
      dia_semana: dia,
      hora_inicio: "09:00",
      hora_fin: "18:00",
    });
    cargar();
  }

  async function cerrarDia(horarioId) {
    await horariosProfesionalApi.remove(horarioId);
    cargar();
  }

  async function actualizarHora(horarioId, campo, valor) {
    await horariosProfesionalApi.update(horarioId, { [campo]: valor });
    cargar();
  }

  if (!horarios) return <p>Cargando horario...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Día</th>
          <th>Desde</th>
          <th>Hasta</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {DIAS.map((dia) => {
          const horario = horarioDelDia(dia.valor);
          return (
            <tr key={dia.valor}>
              <td>{dia.nombre}</td>
              {horario ? (
                <>
                  <td>
                    <input
                      type="time"
                      defaultValue={horario.hora_inicio}
                      onBlur={(e) => actualizarHora(horario.id, "hora_inicio", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      defaultValue={horario.hora_fin}
                      onBlur={(e) => actualizarHora(horario.id, "hora_fin", e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => cerrarDia(horario.id)}>Cerrado ese día</button>
                  </td>
                </>
              ) : (
                <>
                  <td colSpan={2}>Cerrado</td>
                  <td>
                    <button onClick={() => abrirDia(dia.valor)}>Abrir</button>
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
