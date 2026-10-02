import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EquipoPage, { EQUIPO, iniciales } from "./EquipoPage";

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

  it("muestra la foto real de cada integrante (sin iniciales de respaldo)", () => {
    renderPage();
    const lorca = screen.getByAltText("Dra. María José Lorca");
    expect(lorca.tagName).toBe("IMG");
    const pamela = screen.getByAltText("Pamela González Ríos");
    expect(pamela.tagName).toBe("IMG");
  });

  it("no muestra lista de credenciales cuando esta vacia", () => {
    renderPage();
    const pamela = screen.getByText("Pamela González Ríos");
    expect(pamela.closest("li").querySelector(".cs-team-credenciales")).toBeNull();
  });

  it("calcula iniciales para nombres con y sin tratamiento", () => {
    expect(iniciales("Dra. Ana Soto")).toBe("AS");
    expect(iniciales("Luis Pérez")).toBe("LP");
  });

  it("muestra iniciales cuando falta la foto de una persona", () => {
    const fotoOriginal = EQUIPO[0].foto;
    EQUIPO[0].foto = "";
    renderPage();
    expect(screen.getByText("MJ")).toBeInTheDocument();
    EQUIPO[0].foto = fotoOriginal;
  });
});
