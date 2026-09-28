import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LOGO_URL =
  "https://clinicadentalelmirador.cl/wp-content/uploads/2021/01/3-traansparente.png";

export default function Layout({ children }) {
  const { isStaff, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <img src={LOGO_URL} alt="Clínica Dental El Mirador" />
          <span>Clínica Dental El Mirador</span>
        </div>
        <nav className="app-nav">
          {isStaff ? (
            <>
              <NavLink to="/staff" end>
                Panel
              </NavLink>
              <NavLink to="/staff/pacientes">Pacientes</NavLink>
              <NavLink to="/staff/agenda">Agenda</NavLink>
              <NavLink to="/staff/profesionales">Profesionales</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/citas">Mis citas</NavLink>
              <NavLink to="/mi-ficha">Mi ficha</NavLink>
              <NavLink to="/mis-pagos">Mis pagos</NavLink>
            </>
          )}
          <NavLink to="/cambiar-password">Cambiar contraseña</NavLink>
        </nav>
        <button className="app-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
