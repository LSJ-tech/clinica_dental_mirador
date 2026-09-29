import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TerminosCondicionesPage from "./TerminosCondicionesPage";

describe("TerminosCondicionesPage", () => {
  it("muestra el título y las secciones clave", () => {
    render(
      <MemoryRouter>
        <TerminosCondicionesPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: "Términos y Condiciones de Uso" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2. Reservas de hora" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4. Pagos" })).toBeInTheDocument();
  });
});
