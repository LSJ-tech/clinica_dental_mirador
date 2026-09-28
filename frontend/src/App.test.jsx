import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("renderiza la landing en la ruta raiz", () => {
    render(<App />);
    expect(screen.getAllByText("Reservar hora").length).toBeGreaterThan(0);
  });

  it("redirige una ruta desconocida a la landing", () => {
    window.history.pushState({}, "", "/una-ruta-que-no-existe");
    render(<App />);
    expect(screen.getAllByText("Reservar hora").length).toBeGreaterThan(0);
  });

  it("una ruta protegida sin sesion redirige a /login", () => {
    window.history.pushState({}, "", "/staff");
    render(<App />);
    expect(screen.getByText("Clínica Dental El Mirador")).toBeInTheDocument();
  });
});
