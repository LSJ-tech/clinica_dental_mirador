import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { isStaff, logout } = useAuth();

  return (
    <div>
      <nav className="nav">
        {isStaff ? (
          <>
            <Link to="/staff">Panel</Link>
            <Link to="/staff/pacientes">Pacientes</Link>
            <Link to="/staff/agenda">Agenda</Link>
            <Link to="/staff/profesionales">Profesionales</Link>
          </>
        ) : (
          <>
            <Link to="/citas">Mis citas</Link>
            <Link to="/mi-ficha">Mi ficha</Link>
            <Link to="/mis-pagos">Mis pagos</Link>
          </>
        )}
        <button onClick={logout}>Cerrar sesión</button>
      </nav>
      <main className="contenido">{children}</main>
    </div>
  );
}
