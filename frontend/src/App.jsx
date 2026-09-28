import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/public/LandingPage";
import EquipoPage from "./pages/public/EquipoPage";
import ReservarPage from "./pages/public/ReservarPage";
import CitasPage from "./pages/patient/CitasPage";
import FichaClinicaPage from "./pages/patient/FichaClinicaPage";
import PagosPage from "./pages/patient/PagosPage";
import DashboardPage from "./pages/staff/DashboardPage";
import PacientesListPage from "./pages/staff/PacientesListPage";
import PacienteDetailPage from "./pages/staff/PacienteDetailPage";
import AgendaPage from "./pages/staff/AgendaPage";
import ProfesionalesPage from "./pages/staff/ProfesionalesPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
          <Route path="/reservar" element={<ReservarPage />} />

          <Route
            path="/citas"
            element={
              <RutaProtegida>
                <Layout>
                  <CitasPage />
                </Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/mi-ficha"
            element={
              <RutaProtegida>
                <Layout>
                  <FichaClinicaPage />
                </Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-pagos"
            element={
              <RutaProtegida>
                <Layout>
                  <PagosPage />
                </Layout>
              </RutaProtegida>
            }
          />

          <Route
            path="/staff"
            element={
              <RutaProtegida staffOnly>
                <Layout>
                  <DashboardPage />
                </Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/pacientes"
            element={
              <RutaProtegida staffOnly>
                <Layout>
                  <PacientesListPage />
                </Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/pacientes/:id"
            element={
              <RutaProtegida staffOnly>
                <Layout>
                  <PacienteDetailPage />
                </Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/agenda"
            element={
              <RutaProtegida staffOnly>
                <Layout>
                  <AgendaPage />
                </Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/profesionales"
            element={
              <RutaProtegida staffOnly>
                <Layout>
                  <ProfesionalesPage />
                </Layout>
              </RutaProtegida>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
