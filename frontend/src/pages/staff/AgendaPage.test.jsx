import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AgendaPage from "./AgendaPage";
import { citasApi, disponibilidadApi, pacientesApi, profesionalesApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  citasApi: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
  pacientesApi: { list: vi.fn() },
  profesionalesApi: { list: vi.fn() },
  disponibilidadApi: { get: vi.fn() },
}));

describe("AgendaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pacientesApi.list.mockResolvedValue({ data: [{ id: 1, nombre: "Ana" }] });
    profesionalesApi.list.mockResolvedValue({ data: [{ id: 1, nombre: "Dra. Soto" }] });
    citasApi.list.mockResolvedValue({ data: [] });
    disponibilidadApi.get.mockResolvedValue({ data: { slots: [] } });
  });

  it("carga citas del dia actual al montar", async () => {
    render(<AgendaPage />);
    await waitFor(() => expect(citasApi.list).toHaveBeenCalled());
  });

  it("recarga citas al cambiar la fecha", async () => {
    render(<AgendaPage />);
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-10-03" } });
    await waitFor(() => expect(citasApi.list).toHaveBeenCalledWith({ fecha: "2026-10-03" }));
  });

  it("muestra la lista de citas del dia en la tabla", async () => {
    citasApi.list.mockResolvedValue({
      data: [
        {
          id: 1, hora: "10:00", paciente_nombre: "Ana",
          profesional_nombre: "Dra. Soto", box: "1", estado: "pendiente",
        },
      ],
    });
    render(<AgendaPage />);
    const tabla = await screen.findByRole("table");
    expect(within(tabla).getByText("Ana")).toBeInTheDocument();
  });

  it("crea una cita nueva con el formulario", async () => {
    const user = userEvent.setup();
    citasApi.create.mockResolvedValue({ data: {} });
    render(<AgendaPage />);
    await waitFor(() =>
      expect(screen.getByLabelText("Paciente").querySelectorAll("option").length).toBe(2)
    );
    await user.selectOptions(screen.getByLabelText("Paciente"), "1");
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    await user.type(screen.getByLabelText("Hora"), "10:00");
    await user.clear(screen.getByLabelText("Box"));
    await user.type(screen.getByLabelText("Box"), "2");
    await user.click(screen.getByText("Agendar"));
    await waitFor(() => expect(citasApi.create).toHaveBeenCalled());
  });

  it("muestra un error si la creacion choca con otra hora", async () => {
    const user = userEvent.setup();
    citasApi.create.mockRejectedValue(new Error("choque"));
    render(<AgendaPage />);
    await waitFor(() =>
      expect(screen.getByLabelText("Paciente").querySelectorAll("option").length).toBe(2)
    );
    await user.selectOptions(screen.getByLabelText("Paciente"), "1");
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    await user.type(screen.getByLabelText("Hora"), "10:00");
    await user.click(screen.getByText("Agendar"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo crear la cita (revisa que no choque con otra hora)."
    );
  });

  it("muestra un error si falla una carga de agenda", async () => {
    citasApi.list.mockRejectedValue(new Error("citas"));
    pacientesApi.list.mockRejectedValue(new Error("pacientes"));
    profesionalesApi.list.mockRejectedValue(new Error("profesionales"));
    render(<AgendaPage />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("muestra un error si falla la disponibilidad del profesional", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockRejectedValue(new Error("network"));
    render(<AgendaPage />);
    await waitFor(() =>
      expect(screen.getByLabelText("Paciente").querySelectorAll("option").length).toBe(2)
    );
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la disponibilidad."
    );
  });

  it("muestra el horario disponible del profesional al elegirlo y permite tocar una hora", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00", "09:30"] } });
    render(<AgendaPage />);
    await waitFor(() =>
      expect(screen.getByLabelText("Paciente").querySelectorAll("option").length).toBe(2)
    );
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    expect(await screen.findByText("09:00")).toBeInTheDocument();
    await user.click(screen.getByText("09:30"));
    expect(screen.getByLabelText("Hora")).toHaveValue("09:30");
  });

  it("cambia el estado de una cita con los botones de accion", async () => {
    const user = userEvent.setup();
    citasApi.list.mockResolvedValue({
      data: [
        {
          id: 1, hora: "10:00", paciente_nombre: "Ana",
          profesional_nombre: "Dra. Soto", box: "1", estado: "pendiente",
        },
      ],
    });
    citasApi.update.mockResolvedValue({ data: {} });
    render(<AgendaPage />);
    const tabla = await screen.findByRole("table");
    await user.click(within(tabla).getByText("Confirmar"));
    expect(citasApi.update).toHaveBeenCalledWith(1, { estado: "confirmada" });
    await waitFor(() => expect(citasApi.list).toHaveBeenCalledTimes(2));
  });

  it("permite completar, marcar ausencia y cancelar una cita", async () => {
    const user = userEvent.setup();
    citasApi.list.mockResolvedValue({
      data: [{ id: 1, hora: "10:00", paciente_nombre: "Ana", profesional_nombre: "Dra. Soto", box: "1", estado: "pendiente" }],
    });
    citasApi.update.mockResolvedValue({ data: {} });
    render(<AgendaPage />);
    const tabla = await screen.findByRole("table");
    await user.click(within(tabla).getByText("Completar"));
    await user.click(within(tabla).getByText("No asistió"));
    await user.click(within(tabla).getByText("Cancelar"));
    expect(citasApi.update).toHaveBeenNthCalledWith(1, 1, { estado: "completada" });
    expect(citasApi.update).toHaveBeenNthCalledWith(2, 1, { estado: "no_asistio" });
    expect(citasApi.update).toHaveBeenNthCalledWith(3, 1, { estado: "cancelada" });
    await waitFor(() => expect(citasApi.list).toHaveBeenCalledTimes(4));
  });
});
