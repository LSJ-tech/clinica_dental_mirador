import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
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
          <nav className="cs-footer-legal">
            <Link to="/politica-de-privacidad">Política de Privacidad</Link>
            <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>
            <Link to="/politica-de-cookies">Política de Cookies</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
