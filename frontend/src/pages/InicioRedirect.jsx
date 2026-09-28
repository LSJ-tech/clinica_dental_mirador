import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function InicioRedirect() {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <p>Cargando...</p>;
  }
  return <Navigate to={isStaff ? "/staff" : "/citas"} replace />;
}
