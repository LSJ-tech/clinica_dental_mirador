import { Link } from "react-router-dom";
import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";
import SERVICIOS from "./servicios.json";
import "./landing.css";

const WHATSAPP_DUDAS_URL =
  "https://wa.me/56956043960?text=" +
  encodeURIComponent("Hola! Tengo una duda sobre sus servicios dentales.");

// Fotos de stock (Pexels, uso libre) como referencia visual mientras se
// consiguen fotos reales de la clínica y su equipo. Cada una es distinta
// y elegida según el servicio/sección que ilustra -- ninguna se repite.
const FOTOS = {
  hero: "https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800",
  equipo: "https://images.pexels.com/photos/6627466/pexels-photo-6627466.jpeg?auto=compress&cs=tinysrgb&w=800",
  paciente: "https://images.pexels.com/photos/6627574/pexels-photo-6627574.jpeg?auto=compress&cs=tinysrgb&w=600",
};

export default function LandingPage() {
  return (
    <div className="cs-landing">
      <PublicNav />

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
            <Link to="/reservar" className="cs-link">
              Reservar hora
            </Link>
            <a href={WHATSAPP_DUDAS_URL} className="cs-button-outline" target="_blank" rel="noreferrer">
              ¿Dudas? Escríbenos por WhatsApp
            </a>
          </div>
          <div className="cs-hero-image">
            <img src={FOTOS.hero} alt="Paciente sonriendo en la clínica" loading="lazy" />
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
              <img src={FOTOS.equipo} alt="Dentista atendiendo a un paciente" loading="lazy" />
            </div>
            <div className="cs-flex2">
              <div className="cs-small-picture">
                <img src={FOTOS.paciente} alt="Paciente satisfecha con su tratamiento" loading="lazy" />
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
                <img className="cs-background" src={s.foto} alt="" aria-hidden="true" loading="lazy" />
                {/* Sin acción real todavía (no hay página de detalle por
                    servicio) -- un div, no un <a>/<button> falso. */}
                <div className="cs-link">
                  <h3 className="cs-h3">
                    <span className="cs-span">{s.destacado}</span>
                    <span className="cs-nombre">{s.nombre}</span>
                  </h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="ubicacion">
        <div className="cs-container">
          <span className="cs-topper">Cómo llegar</span>
          <h2 className="cs-title">Estamos en El Mirador, Casablanca</h2>
          <p className="cs-text">El Mirador #459 (Sitio 17-E), a pocos minutos de la plaza de Casablanca.</p>
          <iframe
            className="cs-mapa"
            title="Ubicación de Clínica Dental El Mirador"
            src="https://maps.google.com/maps?q=33%C2%B019%2730.1%22S%2071%C2%B024%2724.5%22W&t=m&z=15&output=embed&iwloc=near"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
