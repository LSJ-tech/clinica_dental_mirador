import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FichaClinicaPage from "./FichaClinicaPage";
import { fichasClinicasApi, tratamientosApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  fichasClinicasApi: { list: vi.fn() },
  tratamientosApi: { list: vi.fn() },
}));

describe("FichaClinicaPage", () => {
  it("muestra un error si la carga falla", async () => {
    fichasClinicasApi.list.mockRejectedValue(new Error("fail"));
    render(<FichaClinicaPage />);
    expect(await screen.findByText("No se pudo cargar tu ficha clínica.")).toBeInTheDocument();
  });

  it("muestra los textos por defecto si la ficha esta vacia", async () => {
    fichasClinicasApi.list.mockResolvedValue({
      data: [{ id: 1, historial: "", notas_clinicas: "" }],
    });
    tratamientosApi.list.mockResolvedValue({ data: [] });
    render(<FichaClinicaPage />);
    expect(await screen.findByText("Sin registros todavía.")).toBeInTheDocument();
    expect(screen.getByText("Sin notas todavía.")).toBeInTheDocument();
    expect(screen.getByText("No tienes tratamientos registrados.")).toBeInTheDocument();
  });

  it("muestra el historial, notas y tabla de tratamientos", async () => {
    fichasClinicasApi.list.mockResolvedValue({
      data: [{ id: 1, historial: "Sin alergias", notas_clinicas: "Paciente colaborador" }],
    });
    tratamientosApi.list.mockResolvedValue({
      data: [{ id: 1, tipo: "Limpieza", costo: 20000, estado: "completado" }],
    });
    render(<FichaClinicaPage />);
    expect(await screen.findByText("Sin alergias")).toBeInTheDocument();
    expect(screen.getByText("Paciente colaborador")).toBeInTheDocument();
    expect(screen.getByText("Limpieza")).toBeInTheDocument();
  });
});
