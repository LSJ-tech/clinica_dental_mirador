import { Link } from "react-router-dom";
import "./landing.css";

const WHATSAPP_DUDAS_URL =
  "https://wa.me/56956043960?text=" +
  encodeURIComponent("Hola! Tengo una duda sobre sus servicios dentales.");

const SERVICIOS = [
  { destacado: "Odontología", nombre: "General" },
  { destacado: "Corrección", nombre: "Ortodoncia" },
  { destacado: "Tratamiento de", nombre: "Endodoncia" },
  { destacado: "Prótesis", nombre: "Fijas y Removibles" },
  { destacado: "Servicio de", nombre: "Extracciones" },
  { destacado: "Higiene y", nombre: "Limpieza Dental" },
  { destacado: "Atención de", nombre: "Urgencias" },
  { destacado: "Cuidado para", nombre: "Niños y Adultos" },
  { destacado: "Servicios de", nombre: "Estética Facial" },
];

export default function LandingPage() {
  return (
    <div className="cs-landing">
      <nav className="cs-landing-nav">
        <span className="cs-logo">Clínica Dental El Mirador</span>
        <ul>
          <li>
            <a href="#why-choose-2058">Por qué elegirnos</a>
          </li>
          <li>
            <a href="#services-1354">Servicios</a>
          </li>
        </ul>
        <Link to="/login" className="cs-button-outline">
          Ingresar
        </Link>
      </nav>

      <section className="cs-hero">
        <div className="cs-container">
          <div className="cs-hero-content">
            <span className="cs-topper">Casablanca, Chile</span>
            <h2 className="cs-title">Buen trato, atención personalizada y honestidad en tu tratamiento</h2>
            <p className="cs-text">
              Somos una clínica dental familiar en Casablanca. Odontología general, ortodoncia,
              endodoncia, prótesis y urgencias, con convenio para derivaciones de implantología y
              maxilofacial.
            </p>
            <a href="#services-1354" className="cs-link">
              Ver servicios
            </a>
            <a href={WHATSAPP_DUDAS_URL} className="cs-button-outline" target="_blank" rel="noreferrer">
              ¿Dudas? Escríbenos por WhatsApp
            </a>
          </div>
          <div className="cs-hero-image">
            <div className="cs-placeholder">Foto de la clínica</div>
          </div>
        </div>
      </section>

      <section id="why-choose-2058">
        <div className="cs-container">
          <div className="cs-flex1">
            <div className="cs-content">
              <span className="cs-topper">Por qué elegirnos</span>
              <h2 className="cs-title">Sonrisas más sanas y radiantes es nuestra pasión</h2>
              <p className="cs-text">
                Somos un equipo de dentistas especializadas, técnico en odontología y atención
                cercana, pensado para que cada visita sea tranquila. Trabajamos con honestidad en
                cada diagnóstico y tratamiento, sin recomendaciones innecesarias.
              </p>
              <a className="cs-link" href="#services-1354">
                Conoce nuestros servicios
              </a>
            </div>
            <div className="cs-video-wrapper">
              <div className="cs-placeholder">Foto del equipo</div>
            </div>
            <div className="cs-flex2">
              <div className="cs-small-picture">
                <div className="cs-placeholder">Foto de atención</div>
              </div>
              <ul className="cs-services">
                <li className="cs-item">
                  <h3 className="cs-h3">Atención cercana</h3>
                  <p className="cs-item-text">
                    Buen trato y atención personalizada en cada visita, para pacientes de todas las
                    edades.
                  </p>
                </li>
                <li className="cs-item">
                  <h3 className="cs-h3">Convenio con especialistas</h3>
                  <p className="cs-item-text">
                    Derivación directa a implantólogo y maxilofacial cuando el tratamiento lo
                    requiere.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="services-1354">
        <div className="cs-container">
          <div className="cs-content">
            <span className="cs-topper">Nuestros servicios</span>
            <h2 className="cs-title">Atención dental completa para toda la familia</h2>
          </div>
          <ul className="cs-card-group">
            {SERVICIOS.map((s) => (
              <li className="cs-item" key={s.nombre}>
                <div className="cs-background cs-placeholder" aria-hidden="true"></div>
                <a href="#" className="cs-link" onClick={(e) => e.preventDefault()}>
                  <h3 className="cs-h3">
                    <span className="cs-span">{s.destacado}</span>
                    {s.nombre}
                  </h3>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="cs-landing-footer">
        <div className="cs-container">
          <span>Clínica Dental El Mirador — El Mirador #459 (Sitio 17-E), Casablanca</span>
          <span>+569 5604 3960 · clinicadentalelmirador2020@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
