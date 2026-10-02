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

  it("muestra un error si falla la carga de profesionales", async () => {
    profesionalesApi.list.mockRejectedValue(new Error("network"));
    render(<ProfesionalesPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los profesionales."
    );
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

  it("actualiza un profesional existente", async () => {
    const user = userEvent.setup();
    profesionalesApi.update.mockResolvedValue({});
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Editar"));
    await user.clear(screen.getByLabelText("Especialidad"));
    await user.type(screen.getByLabelText("Especialidad"), "Endodoncia");
    await user.click(screen.getByText("Guardar"));
    await waitFor(() => expect(profesionalesApi.update).toHaveBeenCalledWith(1, {
      nombre: "Dra. Soto", especialidad: "Endodoncia", box_asignado: "1",
    }));
    await waitFor(() => expect(profesionalesApi.list).toHaveBeenCalledTimes(2));
  });

  it("actualiza una hora del horario al perder foco", async () => {
    const user = userEvent.setup();
    horariosProfesionalApi.list.mockResolvedValue({
      data: [{ id: 10, profesional: 1, dia_semana: 0, hora_inicio: "09:00", hora_fin: "18:00" }],
    });
    horariosProfesionalApi.update.mockResolvedValue({});
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Horario"));
    const desde = await screen.findByDisplayValue("09:00");
    await user.clear(desde);
    await user.type(desde, "10:00");
    await user.tab();
    await waitFor(() => expect(horariosProfesionalApi.update).toHaveBeenCalledWith(10, {
      hora_inicio: "10:00",
    }));
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
    await waitFor(() => expect(horariosProfesionalApi.list).toHaveBeenCalledTimes(2));
  });

  it("muestra un error si falla la carga del horario", async () => {
    const user = userEvent.setup();
    horariosProfesionalApi.list.mockRejectedValue(new Error("network"));
    render(<ProfesionalesPage />);
    await screen.findByText("Dra. Soto");
    await user.click(screen.getByText("Horario"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar el horario."
    );
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
    await waitFor(() => expect(horariosProfesionalApi.list).toHaveBeenCalledTimes(2));
  });
});
