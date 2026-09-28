import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("muestra la etiqueta legible y el tono verde para estados positivos", () => {
    render(<Badge estado="confirmada" />);
    const badge = screen.getByText("Confirmada");
    expect(badge).toHaveClass("badge-verde");
  });

  it("muestra el tono rojo para estados negativos", () => {
    render(<Badge estado="cancelada" />);
    expect(screen.getByText("Cancelada")).toHaveClass("badge-rojo");
  });

  it("muestra el tono azul para en_curso", () => {
    render(<Badge estado="en_curso" />);
    expect(screen.getByText("En curso")).toHaveClass("badge-azul");
  });

  it("usa el tono ambar por defecto (ej. pendiente, presupuestado)", () => {
    render(<Badge estado="pendiente" />);
    expect(screen.getByText("Pendiente")).toHaveClass("badge-ambar");
  });

  it("si el estado no esta mapeado, muestra el valor crudo igual", () => {
    render(<Badge estado="algo_desconocido" />);
    expect(screen.getByText("algo_desconocido")).toHaveClass("badge-ambar");
  });
});
