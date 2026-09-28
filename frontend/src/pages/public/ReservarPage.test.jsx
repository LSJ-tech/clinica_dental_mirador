import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ReservarPage from "./ReservarPage";
import { disponibilidadApi, profesionalesApi, reservasApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  disponibilidadApi: { get: vi.fn() },
  profesionalesApi: { list: vi.fn() },
  reservasApi: { create: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ReservarPage />
    </MemoryRouter>
  );
}

async function completarHastaElegirHora(user) {
  await screen.findByText("Dra. Soto — General");
  await user.selectOptions(screen.getByLabelText("Profesional"), "1");
  await user.click(await screen.findByText("09:00"));
}

describe("ReservarPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profesionalesApi.list.mockResolvedValue({
      data: [{ id: 1, nombre: "Dra. Soto", especialidad: "General" }],
    });
  });

  it("carga la lista de profesionales al montar", async () => {
    renderPage();
    expect(await screen.findByText("Dra. Soto — General")).toBeInTheDocument();
  });

  it("muestra los horarios disponibles al elegir profesional", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00", "09:30"] } });
    renderPage();
    await screen.findByText("Dra. Soto — General");
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    expect(await screen.findByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("muestra un mensaje si no hay horas disponibles", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: [] } });
    renderPage();
    await screen.findByText("Dra. Soto — General");
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    expect(
      await screen.findByText("No hay horas disponibles ese día. Prueba con otra fecha.")
    ).toBeInTheDocument();
  });

  it("completa el flujo de reserva hasta la confirmacion", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockResolvedValue({ data: { fecha: "2026-02-01", hora: "09:00:00" } });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.click(screen.getByText("Confirmar hora de las 09:00"));
    await waitFor(() => expect(reservasApi.create).toHaveBeenCalled());
    expect(await screen.findByText(/quedó registrada como/)).toBeInTheDocument();
  });

  it("si el horario ya no esta disponible, muestra error y recarga los slots", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockRejectedValue({ response: { status: 400 } });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.click(screen.getByText(/Confirmar hora/));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ese horario ya no está disponible. Elige otro por favor."
    );
  });

  it("muestra un error generico si la reserva falla por otro motivo", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockRejectedValue(new Error("network"));
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.click(screen.getByText(/Confirmar hora/));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo completar la reserva. Intenta nuevamente."
    );
  });
});
