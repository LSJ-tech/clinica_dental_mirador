import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./DashboardPage";
import { citasApi, pacientesApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  citasApi: { list: vi.fn() },
  pacientesApi: { list: vi.fn() },
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
});
