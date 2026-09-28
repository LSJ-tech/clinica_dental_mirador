import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";

const mockUseAuth = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderConRuta(staffOnly) {
  return render(
    <MemoryRouter initialEntries={["/protegida"]}>
      <Routes>
        <Route path="/login" element={<p>pagina de login</p>} />
        <Route path="/citas" element={<p>mis citas</p>} />
        <Route
          path="/protegida"
          element={
            <RutaProtegida staffOnly={staffOnly}>
              <p>contenido</p>
            </RutaProtegida>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("RutaProtegida", () => {
  it("redirige a /login si no esta autenticado", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isStaff: false, loading: false });
    renderConRuta(false);
    expect(screen.getByText("pagina de login")).toBeInTheDocument();
  });

  it("muestra Cargando mientras loading es true", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isStaff: false, loading: true });
    renderConRuta(false);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("redirige a /citas si staffOnly y el usuario no es staff", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isStaff: false, loading: false });
    renderConRuta(true);
    expect(screen.getByText("mis citas")).toBeInTheDocument();
  });

  it("muestra el contenido si esta autenticado y cumple los requisitos", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isStaff: true, loading: false });
    renderConRuta(true);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });
});
