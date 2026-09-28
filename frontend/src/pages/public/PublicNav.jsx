import { useState } from "react";
import { Link } from "react-router-dom";

export default function PublicNav() {
  const [abierto, setAbierto] = useState(false);

  function cerrar() {
    setAbierto(false);
  }

  return (
    <nav className="cs-landing-nav">
      <Link to="/" onClick={cerrar}>
        <img
          className="cs-logo"
          src="https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/3-traansparente.png"
          alt="Clínica Dental El Mirador"
        />
      </Link>
      <button
        className="cs-nav-toggle"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir menú"
        aria-expanded={abierto}
      >
        ☰
      </button>
      <ul className={abierto ? "cs-nav-abierto" : ""}>
        <li>
          <a href="/#why-choose-2058" onClick={cerrar}>
            Por qué elegirnos
          </a>
        </li>
        <li>
          <a href="/#services-1354" onClick={cerrar}>
            Servicios
          </a>
        </li>
        <li>
          <Link to="/equipo" onClick={cerrar}>
            Nuestro equipo
          </Link>
        </li>
        <li>
          <a href="/#ubicacion" onClick={cerrar}>
            Ubicación
          </a>
        </li>
        <li>
          <Link to="/reservar" onClick={cerrar}>
            Reservar hora
          </Link>
        </li>
        <li className="cs-nav-solo-mobile">
          <Link to="/login" onClick={cerrar}>
            Ingresar
          </Link>
        </li>
      </ul>
      <Link to="/login" className="cs-button-outline cs-nav-solo-desktop">
        Ingresar
      </Link>
    </nav>
  );
}
