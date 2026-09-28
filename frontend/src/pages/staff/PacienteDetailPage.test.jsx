import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PacienteDetailPage from "./PacienteDetailPage";
import {
  citasApi, disponibilidadApi, fichasClinicasApi, pagosApi, pacientesApi, profesionalesApi,
  tratamientosApi,
} from "../../api/resources";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useParams: () => ({ id: "1" }), useNavigate: () => mockNavigate };
});

const mockUseAuth = vi.fn();
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../api/resources", () => ({
  citasApi: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
  fichasClinicasApi: { list: vi.fn(), update: vi.fn() },
  pagosApi: { list: vi.fn(), create: vi.fn() },
  pacientesApi: { get: vi.fn(), update: vi.fn(), remove: vi.fn() },
  profesionalesApi: { list: vi.fn() },
  tratamientosApi: { list: vi.fn(), create: vi.fn() },
  disponibilidadApi: { get: vi.fn() },
}));

function datosBase() {
  pacientesApi.get.mockResolvedValue({
    data: {
      id: 1, nombre: "Ana Torres", telefono: "+56911111111",
      fecha_nacimiento: "2000-01-01", rut: "1-9",
    },
  });
  fichasClinicasApi.list.mockResolvedValue({
    data: [{ id: 5, paciente: 1, historial: "hist", notas_clinicas: "notas" }],
  });
  tratamientosApi.list.mockResolvedValue({ data: [] });
  pagosApi.list.mockResolvedValue({ data: [] });
  profesionalesApi.list.mockResolvedValue({ data: [{ id: 1, nombre: "Dra. Soto" }] });
  citasApi.list.mockResolvedValue({ data: [] });
  disponibilidadApi.get.mockResolvedValue({ data: { slots: [] } });
}

describe("PacienteDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    datosBase();
    mockUseAuth.mockReturnValue({ isSuperuser: false });
  });

  it("muestra el nombre del paciente y el formulario de datos", async () => {
    render(<PacienteDetailPage />);
    expect(await screen.findByRole("heading", { name: "Ana Torres" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana Torres");
  });

  it("guarda los cambios del formulario de datos del paciente", async () => {
    const user = userEvent.setup();
    pacientesApi.update.mockResolvedValue({
      data: {
        id: 1, nombre: "Ana T.", telefono: "+56911111111",
        fecha_nacimiento: "2000-01-01", rut: "1-9",
      },
    });
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    // Cambia de tab para evitar el "Guardar" duplicado del tab Ficha.
    await user.click(screen.getByRole("button", { name: "Pagos" }));
    await user.clear(screen.getByLabelText("Nombre"));
    await user.type(screen.getByLabelText("Nombre"), "Ana T.");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() => expect(pacientesApi.update).toHaveBeenCalled());
  });

  it("tab Ficha: muestra historial/notas y permite guardarlos", async () => {
    const user = userEvent.setup();
    fichasClinicasApi.update.mockResolvedValue({
      data: { id: 5, historial: "nuevo", notas_clinicas: "notas" },
    });
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    expect(await screen.findByDisplayValue("hist")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Historial"));
    await user.type(screen.getByLabelText("Historial"), "nuevo");
    const botonesGuardar = screen.getAllByRole("button", { name: "Guardar" });
    await user.click(botonesGuardar[1]);
    await waitFor(() => expect(fichasClinicasApi.update).toHaveBeenCalled());
  });

  it("tab Tratamientos: lista y crea un tratamiento", async () => {
    const user = userEvent.setup();
    tratamientosApi.list.mockResolvedValue({
      data: [{ id: 1, tipo: "Limpieza", costo: 20000, estado: "completado" }],
    });
    tratamientosApi.create.mockResolvedValue({});
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    await user.click(screen.getByRole("button", { name: "Tratamientos" }));
    const tabla = await screen.findByRole("table");
    expect(within(tabla).getByText("Limpieza")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Tipo"), "Endodoncia");
    await user.type(screen.getByLabelText("Costo"), "50000");
    await user.click(screen.getByText("Agregar tratamiento"));
    await waitFor(() => expect(tratamientosApi.create).toHaveBeenCalled());
  });

  it("tab Pagos: lista y registra un pago", async () => {
    const user = userEvent.setup();
    pagosApi.list.mockResolvedValue({
      data: [{ id: 1, fecha: "2026-01-05", monto: 10000, medio_pago: "efectivo", estado: "pagado" }],
    });
    pagosApi.create.mockResolvedValue({});
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    await user.click(screen.getByRole("button", { name: "Pagos" }));
    const tabla = await screen.findByRole("table");
    expect(within(tabla).getByText("efectivo")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Fecha"), "2026-02-01");
    await user.type(screen.getByLabelText("Monto"), "15000");
    await user.click(screen.getByText("Registrar pago"));
    await waitFor(() => expect(pagosApi.create).toHaveBeenCalled());
  });

  it("tab Citas: lista, crea y cambia estado de una cita", async () => {
    const user = userEvent.setup();
    citasApi.list.mockResolvedValue({
      data: [
        {
          id: 1, fecha: "2026-01-05", hora: "10:00",
          profesional_nombre: "Dra. Soto", estado: "pendiente",
        },
      ],
    });
    citasApi.create.mockResolvedValue({});
    citasApi.update.mockResolvedValue({});
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    await user.click(screen.getByRole("button", { name: "Citas" }));
    const tabla = await screen.findByRole("table");
    expect(within(tabla).getByText("Dra. Soto")).toBeInTheDocument();

    await user.click(within(tabla).getByText("Confirmar"));
    expect(citasApi.update).toHaveBeenCalledWith(1, { estado: "confirmada" });

    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["11:00"] } });
    await user.selectOptions(screen.getByLabelText("Profesional"), "1");
    await user.type(screen.getByLabelText("Fecha"), "2026-02-01");
    await user.click(await screen.findByText("11:00"));
    expect(screen.getByLabelText("Hora")).toHaveValue("11:00");
    await user.click(screen.getByText("Agendar"));
    await waitFor(() => expect(citasApi.create).toHaveBeenCalled());
  });

  it("no muestra el botón eliminar paciente para staff normal", async () => {
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    expect(screen.queryByRole("button", { name: "Eliminar paciente" })).not.toBeInTheDocument();
  });

  it("superusuario puede eliminar el paciente tras confirmar", async () => {
    mockUseAuth.mockReturnValue({ isSuperuser: true });
    pacientesApi.remove.mockResolvedValue({});
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    await user.click(screen.getByRole("button", { name: "Eliminar paciente" }));
    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => expect(pacientesApi.remove).toHaveBeenCalledWith("1"));
    expect(mockNavigate).toHaveBeenCalledWith("/staff/pacientes");
    confirmSpy.mockRestore();
  });

  it("no elimina el paciente si el superusuario cancela la confirmación", async () => {
    mockUseAuth.mockReturnValue({ isSuperuser: true });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<PacienteDetailPage />);
    await screen.findByRole("heading", { name: "Ana Torres" });
    await user.click(screen.getByRole("button", { name: "Eliminar paciente" }));
    expect(pacientesApi.remove).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
