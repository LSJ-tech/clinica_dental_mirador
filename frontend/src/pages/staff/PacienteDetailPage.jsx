import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  citasApi,
  fichasClinicasApi,
  pagosApi,
  pacientesApi,
  profesionalesApi,
  tratamientosApi,
} from "../../api/resources";
import TablaPagos from "../../components/TablaPagos";
import TablaTratamientos from "../../components/TablaTratamientos";
import CampoProfesional from "../../components/CampoProfesional";
import CampoHora from "../../components/CampoHora";

const TABS = ["Ficha", "Tratamientos", "Pagos", "Citas"];

export default function PacienteDetailPage() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [tab, setTab] = useState("Ficha");

  useEffect(() => {
    pacientesApi.get(id).then((r) => setPaciente(r.data));
  }, [id]);

  async function guardarPaciente(e) {
    e.preventDefault();
    const respuesta = await pacientesApi.update(id, {
      nombre: paciente.nombre,
      telefono: paciente.telefono,
      fecha_nacimiento: paciente.fecha_nacimiento,
    });
    setPaciente(respuesta.data);
  }

  if (!paciente) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{paciente.nombre}</h1>
      <form onSubmit={guardarPaciente}>
        <label>
          <span>Nombre</span>
          <input
            value={paciente.nombre}
            onChange={(e) => setPaciente({ ...paciente, nombre: e.target.value })}
          />
        </label>
        <label>
          <span>Teléfono</span>
          <input
            value={paciente.telefono}
            onChange={(e) => setPaciente({ ...paciente, telefono: e.target.value })}
          />
        </label>
        <label>
          <span>Fecha de nacimiento</span>
          <input
            type="date"
            value={paciente.fecha_nacimiento || ""}
            onChange={(e) => setPaciente({ ...paciente, fecha_nacimiento: e.target.value })}
          />
        </label>
        <span>RUT: {paciente.rut}</span>
        <button type="submit">Guardar</button>
      </form>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? "activo" : ""}
            onClick={() => setTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Ficha" && <TabFicha pacienteId={id} />}
      {tab === "Tratamientos" && <TabTratamientos pacienteId={id} />}
      {tab === "Pagos" && <TabPagos pacienteId={id} />}
      {tab === "Citas" && <TabCitas pacienteId={id} />}
    </div>
  );
}

function TabFicha({ pacienteId }) {
  const [ficha, setFicha] = useState(null);

  function cargar() {
    fichasClinicasApi.list({ paciente: pacienteId }).then((r) => setFicha(r.data[0] ?? null));
  }

  useEffect(cargar, [pacienteId]);

  async function guardar(e) {
    e.preventDefault();
    const respuesta = await fichasClinicasApi.update(ficha.id, {
      historial: ficha.historial,
      notas_clinicas: ficha.notas_clinicas,
    });
    setFicha(respuesta.data);
  }

  if (!ficha) return <p>Cargando...</p>;

  return (
    <form onSubmit={guardar}>
      <label>
        <span>Historial</span>
        <textarea
          value={ficha.historial}
          onChange={(e) => setFicha({ ...ficha, historial: e.target.value })}
        />
      </label>
      <label>
        <span>Notas clínicas</span>
        <textarea
          value={ficha.notas_clinicas}
          onChange={(e) => setFicha({ ...ficha, notas_clinicas: e.target.value })}
        />
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
}

function TabTratamientos({ pacienteId }) {
  const [fichaId, setFichaId] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [form, setForm] = useState({ tipo: "", costo: "", estado: "presupuestado" });

  function cargar(ficha) {
    tratamientosApi.list({ ficha_clinica: ficha }).then((r) => setTratamientos(r.data));
  }

  useEffect(() => {
    fichasClinicasApi.list({ paciente: pacienteId }).then((r) => {
      const ficha = r.data[0];
      if (ficha) {
        setFichaId(ficha.id);
        cargar(ficha.id);
      }
    });
  }, [pacienteId]);

  async function crear(e) {
    e.preventDefault();
    await tratamientosApi.create({ ...form, ficha_clinica: fichaId });
    setForm({ tipo: "", costo: "", estado: "presupuestado" });
    cargar(fichaId);
  }

  return (
    <div>
      <TablaTratamientos tratamientos={tratamientos} />
      <form onSubmit={crear}>
        <label>
          <span>Tipo</span>
          <input
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Costo</span>
          <input
            type="number"
            value={form.costo}
            onChange={(e) => setForm({ ...form, costo: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Estado</span>
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
          >
            <option value="presupuestado">Presupuestado</option>
            <option value="en_curso">En curso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>
        <button type="submit">Agregar tratamiento</button>
      </form>
    </div>
  );
}

function TabPagos({ pacienteId }) {
  const [pagos, setPagos] = useState([]);
  const [form, setForm] = useState({ monto: "", fecha: "", medio_pago: "efectivo", estado: "pagado" });

  function cargar() {
    pagosApi.list({ paciente: pacienteId }).then((r) => setPagos(r.data));
  }

  useEffect(cargar, [pacienteId]);

  async function crear(e) {
    e.preventDefault();
    await pagosApi.create({ ...form, paciente: pacienteId });
    setForm({ monto: "", fecha: "", medio_pago: "efectivo", estado: "pagado" });
    cargar();
  }

  return (
    <div>
      <TablaPagos pagos={pagos} />
      <form onSubmit={crear}>
        <label>
          <span>Fecha</span>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Monto</span>
          <input
            type="number"
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Medio de pago</span>
          <select
            value={form.medio_pago}
            onChange={(e) => setForm({ ...form, medio_pago: e.target.value })}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <button type="submit">Registrar pago</button>
      </form>
    </div>
  );
}

function TabCitas({ pacienteId }) {
  const [citas, setCitas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState({ profesional: "", fecha: "", hora: "", box: "" });

  function cargar() {
    citasApi.list({ paciente: pacienteId }).then((r) => setCitas(r.data));
  }

  useEffect(() => {
    profesionalesApi.list().then((r) => setProfesionales(r.data));
    cargar();
  }, [pacienteId]);

  async function cambiarEstado(cita, estado) {
    await citasApi.update(cita.id, { estado });
    cargar();
  }

  async function crear(e) {
    e.preventDefault();
    await citasApi.create({ ...form, paciente: pacienteId, estado: "pendiente" });
    setForm({ profesional: "", fecha: "", hora: "", box: "" });
    cargar();
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Profesional</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {citas.map((c) => (
            <tr key={c.id}>
              <td>{c.fecha}</td>
              <td>{c.hora}</td>
              <td>{c.profesional_nombre}</td>
              <td>{c.estado}</td>
              <td>
                <button onClick={() => cambiarEstado(c, "confirmada")}>Confirmar</button>
                <button onClick={() => cambiarEstado(c, "completada")}>Completar</button>
                <button onClick={() => cambiarEstado(c, "cancelada")}>Cancelar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={crear}>
        <CampoProfesional
          value={form.profesional}
          onChange={(e) => setForm({ ...form, profesional: e.target.value })}
          profesionales={profesionales}
        />
        <label>
          <span>Fecha</span>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            required
          />
        </label>
        <CampoHora
          value={form.hora}
          onChange={(e) => setForm({ ...form, hora: e.target.value })}
        />
        <label>
          <span>Box</span>
          <input value={form.box} onChange={(e) => setForm({ ...form, box: e.target.value })} />
        </label>
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
}
