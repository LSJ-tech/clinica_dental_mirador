import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AgendaPage from "./AgendaPage";
import { citasApi, pacientesApi, profesionalesApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  citasApi: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
  pacientesApi: { list: vi.fn() },
  profesionalesApi: { list: vi.fn() },
}));

describe("AgendaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pacientesApi.list.mockResolvedValue({ data: [{ id: 1, nombre: "Ana" }] });
    profesionalesApi.list.mockResolvedValue({ data: [{ id: 1, nombre: "Dra. Soto" }] });
    citasApi.list.mockResolvedValue({ data: [] });
  });

  it("carga citas del dia actual al montar", async () => {
    render(<AgendaPage />);
    await waitFor(() => expect(citasApi.list).toHaveBeenCalled());
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
  });
});
