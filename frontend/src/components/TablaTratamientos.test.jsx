import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TablaTratamientos from "./TablaTratamientos";

describe("TablaTratamientos", () => {
  it("renderiza una fila por cada tratamiento", () => {
    render(
      <TablaTratamientos
        tratamientos={[
          { id: 1, tipo: "Limpieza", costo: 20000, estado: "completado" },
          { id: 2, tipo: "Endodoncia", costo: 80000, estado: "en_curso" },
        ]}
      />
    );
    expect(screen.getByText("Limpieza")).toBeInTheDocument();
    expect(screen.getByText("$20000")).toBeInTheDocument();
    expect(screen.getByText("Endodoncia")).toBeInTheDocument();
    expect(screen.getByText("$80000")).toBeInTheDocument();
  });

  it("renderiza una tabla vacia si no hay tratamientos", () => {
    render(<TablaTratamientos tratamientos={[]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
