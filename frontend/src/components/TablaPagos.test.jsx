import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TablaPagos from "./TablaPagos";

describe("TablaPagos", () => {
  it("renderiza una fila por cada pago", () => {
    render(
      <TablaPagos
        pagos={[
          { id: 1, fecha: "2026-01-05", monto: 10000, medio_pago: "efectivo", estado: "pagado" },
          { id: 2, fecha: "2026-01-06", monto: 20000, medio_pago: "tarjeta", estado: "pendiente" },
        ]}
      />
    );
    expect(screen.getByText("$10000")).toBeInTheDocument();
    expect(screen.getByText("efectivo")).toBeInTheDocument();
    expect(screen.getByText("$20000")).toBeInTheDocument();
    expect(screen.getByText("tarjeta")).toBeInTheDocument();
  });

  it("renderiza una tabla vacia si no hay pagos", () => {
    render(<TablaPagos pagos={[]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /efectivo/ })).not.toBeInTheDocument();
  });
});
