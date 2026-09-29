import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublicFooter from "./PublicFooter";

function renderFooter() {
  return render(
    <MemoryRouter>
      <PublicFooter />
    </MemoryRouter>
  );
}

describe("PublicFooter", () => {
  it("muestra los datos de contacto de la clínica", () => {
    renderFooter();
    expect(screen.getByText("El Mirador #459 (Sitio 17-E), Casablanca")).toBeInTheDocument();
  });

  it("enlaza a las 3 páginas legales", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Política de Privacidad" })).toHaveAttribute(
      "href",
      "/politica-de-privacidad"
    );
    expect(screen.getByRole("link", { name: "Términos y Condiciones" })).toHaveAttribute(
      "href",
      "/terminos-y-condiciones"
    );
    expect(screen.getByRole("link", { name: "Política de Cookies" })).toHaveAttribute(
      "href",
      "/politica-de-cookies"
    );
  });
});
