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
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByText("Confirmar hora de las 09:00"));
    await waitFor(() => expect(reservasApi.create).toHaveBeenCalled());
    expect(await screen.findByText(/quedó confirmada/)).toBeInTheDocument();
  });

  it("no envia la reserva si no se completa el email obligatorio", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.click(screen.getByText("Confirmar hora de las 09:00"));
    expect(reservasApi.create).not.toHaveBeenCalled();
  });

  it("si el horario ya no esta disponible, muestra error y recarga los slots", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockRejectedValue({
      response: { status: 400, data: { horario: "Ese profesional ya tiene una cita a esa hora." } },
    });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByText(/Confirmar hora/));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ese horario ya no está disponible. Elige otro por favor."
    );
  });

  it("un 400 que no es por choque de horario muestra el mensaje real (no el de horario ocupado)", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockRejectedValue({
      response: {
        status: 400,
        data: { password: ["Esta contraseña es demasiado corta."] },
      },
    });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByText(/Confirmar hora/));
    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent("Esta contraseña es demasiado corta.");
    expect(alerta).not.toHaveTextContent("horario ya no está disponible");
    // No debe haber perdido la hora elegida (el form sigue mostrando el boton de confirmar).
    expect(screen.getByText(/Confirmar hora/)).toBeInTheDocument();
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
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByText(/Confirmar hora/));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo completar la reserva. Intenta nuevamente."
    );
  });

  it("el checkbox de crear cuenta muestra los campos de contraseña", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    renderPage();
    await completarHastaElegirHora(user);
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Quiero crear una cuenta para ver mis citas, ficha y pagos"));
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Repetir contraseña")).toBeInTheDocument();
  });

  it("rechaza si las contraseñas no coinciden, sin llamar al api", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(
      screen.getByLabelText("Quiero crear una cuenta para ver mis citas, ficha y pagos")
    );
    await user.type(screen.getByLabelText("Contraseña"), "claveSegura123");
    await user.type(screen.getByLabelText("Repetir contraseña"), "otraClave456");
    await user.click(screen.getByText(/Confirmar hora/));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las contraseñas no coinciden."
    );
    expect(reservasApi.create).not.toHaveBeenCalled();
  });

  it("crea la cuenta al reservar y lo muestra en la confirmacion", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockResolvedValue({
      data: { fecha: "2026-02-01", hora: "09:00:00", cuenta_creada: true },
    });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "11.111.111-1");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(
      screen.getByLabelText("Quiero crear una cuenta para ver mis citas, ficha y pagos")
    );
    await user.type(screen.getByLabelText("Contraseña"), "claveSegura123");
    await user.type(screen.getByLabelText("Repetir contraseña"), "claveSegura123");
    await user.click(screen.getByText(/Confirmar hora/));

    await waitFor(() =>
      expect(reservasApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ crear_cuenta: true, password: "claveSegura123" })
      )
    );
    expect(
      await screen.findByText(/Tu cuenta quedó creada/)
    ).toBeInTheDocument();
  });

  it("envia el email si se ingresa y lo muestra en la confirmacion", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockResolvedValue({ data: { fecha: "2026-02-01", hora: "09:00:00" } });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByText(/Confirmar hora/));

    await waitFor(() =>
      expect(reservasApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "ana@example.com" })
      )
    );
    expect(await screen.findByText(/Te enviamos la confirmación a ana@example.com/)).toBeInTheDocument();
  });

  it("no marca cuenta_creada en la confirmacion si no se pidio crear cuenta", async () => {
    const user = userEvent.setup();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    reservasApi.create.mockResolvedValue({
      data: { fecha: "2026-02-01", hora: "09:00:00", cuenta_creada: false },
    });
    renderPage();
    await completarHastaElegirHora(user);
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Torres");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByText(/Confirmar hora/));

    await waitFor(() =>
      expect(reservasApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ crear_cuenta: false, password: undefined })
      )
    );
    expect(screen.queryByText(/Tu cuenta quedó creada/)).not.toBeInTheDocument();
  });
});
