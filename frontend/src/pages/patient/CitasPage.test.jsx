import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CitasPage from "./CitasPage";
import { citasApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  citasApi: { list: vi.fn() },
}));

describe("CitasPage", () => {
  it("muestra Cargando mientras espera la respuesta", () => {
    citasApi.list.mockReturnValue(new Promise(() => {}));
    render(<CitasPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("muestra un mensaje si no hay citas", async () => {
    citasApi.list.mockResolvedValue({ data: [] });
    render(<CitasPage />);
    expect(await screen.findByText("No tienes citas registradas.")).toBeInTheDocument();
  });

  it("muestra la tabla de citas cuando hay datos", async () => {
    citasApi.list.mockResolvedValue({
      data: [
        {
          id: 1, fecha: "2026-01-05", hora: "10:00",
          profesional_nombre: "Dra. Soto", estado: "pendiente",
        },
      ],
    });
    render(<CitasPage />);
    expect(await screen.findByText("Dra. Soto")).toBeInTheDocument();
  });

  it("muestra un error si la carga falla", async () => {
    citasApi.list.mockRejectedValue(new Error("fail"));
    render(<CitasPage />);
    expect(await screen.findByText("No se pudieron cargar tus citas.")).toBeInTheDocument();
  });
});
