import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "./DashboardPage";
import { citasApi, pacientesApi, recordatoriosApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  citasApi: { list: vi.fn() },
  pacientesApi: { list: vi.fn() },
  recordatoriosApi: { enviar: vi.fn() },
}));

describe("DashboardPage", () => {
  it("muestra ... mientras carga y luego los totales", async () => {
    citasApi.list.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    pacientesApi.list.mockResolvedValue({ data: [{ id: 1 }] });
    render(<DashboardPage />);
    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Citas hoy")).toBeInTheDocument();
    expect(screen.getByText("Pacientes totales")).toBeInTheDocument();
  });

  it("muestra un error si falla la carga del panel", async () => {
    citasApi.list.mockRejectedValue(new Error("citas"));
    pacientesApi.list.mockRejectedValue(new Error("pacientes"));
    render(<DashboardPage />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("dispara el envío de recordatorios y muestra el resultado", async () => {
    citasApi.list.mockResolvedValue({ data: [] });
    pacientesApi.list.mockResolvedValue({ data: [] });
    recordatoriosApi.enviar.mockResolvedValue({
      data: { fecha: "2026-10-03", enviados: 2, fallidos: 1 },
    });
    render(<DashboardPage />);

    await userEvent.click(screen.getByText("Enviar recordatorios de mañana"));

    expect(recordatoriosApi.enviar).toHaveBeenCalled();
    expect(
      await screen.findByText("Recordatorios del 2026-10-03: 2 enviados, 1 fallidos.")
    ).toBeInTheDocument();
  });

  it("muestra un mensaje si falla el envío de recordatorios", async () => {
    citasApi.list.mockResolvedValue({ data: [] });
    pacientesApi.list.mockResolvedValue({ data: [] });
    recordatoriosApi.enviar.mockRejectedValue(new Error("red caída"));
    render(<DashboardPage />);

    await userEvent.click(screen.getByText("Enviar recordatorios de mañana"));

    expect(
      await screen.findByText("No se pudieron enviar los recordatorios. Intenta nuevamente.")
    ).toBeInTheDocument();
  });
});
