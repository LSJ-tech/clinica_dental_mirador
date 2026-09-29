import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PoliticaPrivacidadPage from "./PoliticaPrivacidadPage";

describe("PoliticaPrivacidadPage", () => {
  it("muestra el título y las secciones clave", () => {
    render(
      <MemoryRouter>
        <PoliticaPrivacidadPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: "Política de Privacidad y Seguridad de Datos" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1. Datos que recopilamos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "6. Tus derechos" })).toBeInTheDocument();
  });
});
