import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EquipoPage from "./EquipoPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <EquipoPage />
    </MemoryRouter>
  );
}

describe("EquipoPage", () => {
  it("muestra a todo el equipo con su cargo", () => {
    renderPage();
    expect(screen.getByText("Ing. Moisés Jáuregui Sevich")).toBeInTheDocument();
    expect(screen.getAllByText("Dentista")).toHaveLength(3);
  });

  it("muestra iniciales cuando no hay foto", () => {
    renderPage();
    expect(screen.getByText("MJ")).toBeInTheDocument();
  });

  it("no muestra lista de credenciales cuando esta vacia", () => {
    renderPage();
    const pamela = screen.getByText("Pamela González Ríos");
    expect(pamela.closest("li").querySelector(".cs-team-credenciales")).toBeNull();
  });
});
