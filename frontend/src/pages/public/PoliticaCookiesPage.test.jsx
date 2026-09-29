import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PoliticaCookiesPage from "./PoliticaCookiesPage";

describe("PoliticaCookiesPage", () => {
  it("muestra el título y aclara que no usa cookies de rastreo", () => {
    render(
      <MemoryRouter>
        <PoliticaCookiesPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Política de Cookies" })).toBeInTheDocument();
    expect(
      screen.getByText(/no utiliza cookies de rastreo, analítica ni publicidad/i)
    ).toBeInTheDocument();
  });
});
