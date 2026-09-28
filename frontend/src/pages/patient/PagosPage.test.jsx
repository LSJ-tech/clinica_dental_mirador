import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PagosPage from "./PagosPage";
import { pagosApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  pagosApi: { list: vi.fn() },
}));

describe("PagosPage", () => {
  it("muestra Cargando mientras espera la respuesta", () => {
    pagosApi.list.mockReturnValue(new Promise(() => {}));
    render(<PagosPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("muestra un mensaje si no hay pagos", async () => {
    pagosApi.list.mockResolvedValue({ data: [] });
    render(<PagosPage />);
    expect(await screen.findByText("No tienes pagos registrados.")).toBeInTheDocument();
  });

  it("muestra la tabla de pagos cuando hay datos", async () => {
    pagosApi.list.mockResolvedValue({
      data: [{ id: 1, fecha: "2026-01-05", monto: 10000, medio_pago: "efectivo", estado: "pagado" }],
    });
    render(<PagosPage />);
    expect(await screen.findByText("efectivo")).toBeInTheDocument();
  });

  it("muestra un error si la carga falla", async () => {
    pagosApi.list.mockRejectedValue(new Error("fail"));
    render(<PagosPage />);
    expect(await screen.findByText("No se pudieron cargar tus pagos.")).toBeInTheDocument();
  });
});
