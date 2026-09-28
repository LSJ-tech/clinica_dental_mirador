import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfesionalesPage from "./ProfesionalesPage";
import { horariosProfesionalApi, profesionalesApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  profesionalesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  horariosProfesionalApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn(), update: vi.fn() },
}));

describe("ProfesionalesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profesionalesApi.list.mockResolvedValue({
      data: [{ id: 1, nombre: "Dra. Soto", especialidad: "General", box_asignado: "1" }],
    });
  });

  it("lista los profesionales existentes", async () => {
    render(<ProfesionalesPage />);
    expect(await screen.findByText("Dra. Soto")).toBeInTheDocument();
  });

  it("crea un profesional nuevo", async () => {
    const user = userEvent.setup();
    profesionalesApi.create.mockResolvedValue({});
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.type(screen.getByLabelText("Nombre"), "Dr. Diaz");
    await user.type(screen.getByLabelText("Especialidad"), "Ortodoncia");
    await user.click(screen.getByText("Guardar"));
    await waitFor(() =>
      expect(profesionalesApi.create).toHaveBeenCalledWith({
        nombre: "Dr. Diaz", especialidad: "Ortodoncia", box_asignado: "",
      })
    );
  });

  it("entra en modo edicion y permite cancelar", async () => {
    const user = userEvent.setup();
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Editar"));
    expect(screen.getByText("Editar profesional")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Dra. Soto");
    await user.click(screen.getByText("Cancelar"));
    expect(screen.getByText("Nuevo profesional")).toBeInTheDocument();
  });

  it("elimina un profesional", async () => {
    const user = userEvent.setup();
    profesionalesApi.remove.mockResolvedValue({});
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Eliminar"));
    expect(profesionalesApi.remove).toHaveBeenCalledWith(1);
  });

  it("muestra un error si falla el guardado", async () => {
    const user = userEvent.setup();
    profesionalesApi.create.mockRejectedValue(new Error("fail"));
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.type(screen.getByLabelText("Nombre"), "Dr. Diaz");
    await user.type(screen.getByLabelText("Especialidad"), "Ortodoncia");
    await user.click(screen.getByText("Guardar"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo guardar el profesional."
    );
  });

  it("abre el editor de horario y permite cerrar un dia", async () => {
    const user = userEvent.setup();
    horariosProfesionalApi.list.mockResolvedValue({
      data: [{ id: 10, profesional: 1, dia_semana: 0, hora_inicio: "09:00", hora_fin: "18:00" }],
    });
    horariosProfesionalApi.remove.mockResolvedValue({});
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Horario"));
    expect(await screen.findByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Martes")).toBeInTheDocument();
    await user.click(screen.getByText("Cerrado ese día"));
    expect(horariosProfesionalApi.remove).toHaveBeenCalledWith(10);
  });

  it("permite abrir un dia cerrado", async () => {
    const user = userEvent.setup();
    horariosProfesionalApi.list.mockResolvedValue({ data: [] });
    horariosProfesionalApi.create.mockResolvedValue({});
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Horario"));
    const botonesAbrir = await screen.findAllByText("Abrir");
    await user.click(botonesAbrir[0]);
    expect(horariosProfesionalApi.create).toHaveBeenCalledWith({
      profesional: 1, dia_semana: 0, hora_inicio: "09:00", hora_fin: "18:00",
    });
  });
});
