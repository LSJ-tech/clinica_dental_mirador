import { Link } from "react-router-dom";
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

const SERVICIOS = [
  {
    destacado: "Odontología",
    nombre: "General",
    foto: "https://images.pexels.com/photos/3845748/pexels-photo-3845748.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Corrección",
    nombre: "Ortodoncia",
    foto: "https://images.pexels.com/photos/5524021/pexels-photo-5524021.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Tratamiento de",
    nombre: "Endodoncia",
    foto: "https://images.pexels.com/photos/4971514/pexels-photo-4971514.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Prótesis",
    nombre: "Fijas y Removibles",
    foto: "https://images.pexels.com/photos/11768114/pexels-photo-11768114.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Servicio de",
    nombre: "Extracciones",
    foto: "https://images.pexels.com/photos/6627566/pexels-photo-6627566.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Higiene y",
    nombre: "Limpieza Dental",
    foto: "https://images.pexels.com/photos/3845735/pexels-photo-3845735.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Atención de",
    nombre: "Urgencias",
    foto: "https://images.pexels.com/photos/6193195/pexels-photo-6193195.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Cuidado para",
    nombre: "Niños y Adultos",
    foto: "https://images.pexels.com/photos/8224633/pexels-photo-8224633.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    destacado: "Servicios de",
    nombre: "Estética Facial",
    foto: "https://images.pexels.com/photos/5069612/pexels-photo-5069612.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function LandingPage() {
  return (
    <div className="cs-landing">
      <nav className="cs-landing-nav">
        <img
          className="cs-logo"
          src="https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/3-traansparente.png"
          alt="Clínica Dental El Mirador"
        />
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
                <a href="#" className="cs-link" onClick={(e) => e.preventDefault()}>
                  <h3 className="cs-h3">
                    <span className="cs-span">{s.destacado}</span>
                    <span className="cs-nombre">{s.nombre}</span>
                  </h3>
                </a>
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
