import { useEffect, useState } from "react";
import { profesionalesApi } from "../../api/resources";

const VACIO = { nombre: "", especialidad: "", box_asignado: "" };

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
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
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.especialidad}</td>
              <td>{p.box_asignado}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
                <button onClick={() => eliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editandoId ? "Editar profesional" : "Nuevo profesional"}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </label>
        <label>
          Especialidad
          <input
            value={form.especialidad}
            onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            required
          />
        </label>
        <label>
          Box asignado
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
    </div>
  );
}
