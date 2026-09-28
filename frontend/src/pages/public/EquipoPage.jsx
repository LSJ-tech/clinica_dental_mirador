import { Link } from "react-router-dom";
import "./landing.css";

const BASE = "https://clinicadentalelmirador.cl/wp-content/uploads/2023/09";

const EQUIPO = [
  {
    nombre: "Ing. Moisés Jáuregui Sevich",
    cargo: "Director",
    foto: `${BASE}/FOTO-MOISES-300x300.png`,
    credenciales: [
      "Auxiliar Paramédico en Odontología",
      "Técnico en Prevención de Riesgos",
      "Ingeniero en Prevención de Riesgos",
      "Diplomado en Humanización del Trato Usuario",
      "Diplomado en Formulación de Proyectos de Investigación en APS",
      "Diplomado en Gestión en Atención Primaria de Salud",
      "Diplomado en Promoción de la Salud en Atención Primaria Renovada",
      "Magíster en Gestión Atención Primaria de Salud",
      "Docente Cátedra Salud Pública, Facultad de Odontología, Universidad de Valparaíso",
    ],
  },
  {
    nombre: "Dra. Jenniffer González R.",
    cargo: "Dentista",
    foto: `${BASE}/Foto-Jenniffer-300x300.png`,
    credenciales: [
      "Cirujano Dentista",
      "Licenciada en Odontología",
      "Diplomado en Anomalías Dentomaxilofaciales y Odontopediatría",
      "Diplomado en Humanización del Trato Usuario",
      "Diplomado en Formulación de Proyectos de Investigación en APS",
      "Diplomado en Gestión en Atención Primaria de Salud",
      "Diplomado en Promoción de la Salud en Atención Primaria Renovada",
      "Estética Facial",
      "Magíster en Gestión APS",
    ],
  },
  {
    nombre: "Dra. María José Lorca",
    cargo: "Dentista",
    foto: null,
    credenciales: [
      "Especialista en Endodoncia, Universidad Andrés Bello",
      "Cirujano Dentista, Universidad de Valparaíso",
      "Curso de Rejuvenecimiento Facial Integral en Procedimientos Terapéuticos en el Sistema Estomatognático",
      "Cursando Periodoncia en Universidad de Valparaíso",
      "Docente Cátedra Salud Pública, Facultad de Odontología, Universidad de Valparaíso",
    ],
  },
  {
    nombre: "Dra. Muriel Reyes L.",
    cargo: "Dentista",
    foto: `${BASE}/FOTO-MURIEL-300x300.png`,
    credenciales: [
      "Cirujano Dentista, Universidad Andrés Bello",
      "Licenciada en Odontología",
      "Investigación y Salud Pública",
      "Estética Facial",
    ],
  },
  {
    nombre: "Carolina Guaico M.",
    cargo: "Técnico en Odontología",
    foto: `${BASE}/FOTO-CAROLINA-300x300.png`,
    credenciales: ["Técnico en Odontología, DUOC UC"],
  },
  {
    nombre: "Pamela González Ríos",
    cargo: "Secretaria",
    foto: null,
    credenciales: [],
  },
];

function iniciales(nombre) {
  return nombre
    .replace(/^(Ing\.|Dra\.|Dr\.)\s*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function EquipoPage() {
  return (
    <div className="cs-landing">
      <nav className="cs-landing-nav">
        <Link to="/">
          <img
            className="cs-logo"
            src="https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/3-traansparente.png"
            alt="Clínica Dental El Mirador"
          />
        </Link>
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
        </ul>
        <Link to="/login" className="cs-button-outline">
          Ingresar
        </Link>
      </nav>

      <section>
        <div className="cs-container">
          <span className="cs-topper">Nuestro equipo</span>
          <h2 className="cs-title">Quiénes te van a atender</h2>
          <p className="cs-text">
            Un equipo de profesionales con formación permanente, comprometido con la salud dental
            de Casablanca.
          </p>

          <ul className="cs-team-grid">
            {EQUIPO.map((persona) => (
              <li className="cs-team-card" key={persona.nombre}>
                {persona.foto ? (
                  <img src={persona.foto} alt={persona.nombre} className="cs-team-foto" />
                ) : (
                  <div className="cs-team-foto cs-team-iniciales" aria-hidden="true">
                    {iniciales(persona.nombre)}
                  </div>
                )}
                <h3 className="cs-h3">{persona.nombre}</h3>
                <span className="cs-team-cargo">{persona.cargo}</span>
                {persona.credenciales.length > 0 && (
                  <ul className="cs-team-credenciales">
                    {persona.credenciales.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="cs-landing-footer">
        <div className="cs-container">
          <img
            className="cs-logo-footer"
            src="https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/logo_pie.png"
            alt="Clínica Dental El Mirador"
          />
          <div className="cs-footer-info">
            <span>El Mirador #459 (Sitio 17-E), Casablanca</span>
            <span>+569 5604 3960 · clinicadentalelmirador2020@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
