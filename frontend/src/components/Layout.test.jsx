import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";

const mockUseAuth = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Layout", () => {
  it("muestra el menu de staff cuando isStaff es true", () => {
    mockUseAuth.mockReturnValue({ isStaff: true, logout: vi.fn() });
    render(
      <MemoryRouter>
        <Layout>
          <p>hijo</p>
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText("Panel")).toBeInTheDocument();
    expect(screen.getByText("Profesionales")).toBeInTheDocument();
    expect(screen.queryByText("Mis citas")).not.toBeInTheDocument();
    expect(screen.getByText("hijo")).toBeInTheDocument();
  });

  it("muestra el menu de paciente cuando isStaff es false", () => {
    mockUseAuth.mockReturnValue({ isStaff: false, logout: vi.fn() });
    render(
      <MemoryRouter>
        <Layout>
          <p>hijo</p>
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByText("Mis citas")).toBeInTheDocument();
    expect(screen.queryByText("Panel")).not.toBeInTheDocument();
  });

  it("el boton cerrar sesion llama a logout", async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({ isStaff: false, logout });
    render(
      <MemoryRouter>
        <Layout>
          <p>hijo</p>
        </Layout>
      </MemoryRouter>
    );
    await user.click(screen.getByText("Cerrar sesión"));
    expect(logout).toHaveBeenCalled();
  });
});
