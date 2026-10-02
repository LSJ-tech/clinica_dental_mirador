import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PacientesListPage from "./PacientesListPage";
import { pacientesApi } from "../../api/resources";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../../api/resources", () => ({
  pacientesApi: { list: vi.fn(), create: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <PacientesListPage />
    </MemoryRouter>
  );
}

describe("PacientesListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pacientesApi.list.mockResolvedValue({ data: [] });
  });

  it("carga la lista inicial sin filtro", async () => {
    pacientesApi.list.mockResolvedValueOnce({
      data: [{ id: 1, nombre: "Ana", rut: "1-9", telefono: "+56911111111" }],
    });
    renderPage();
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(pacientesApi.list).toHaveBeenCalledWith(undefined);
  });

  it("busca por texto al enviar el formulario de busqueda", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(pacientesApi.list).toHaveBeenCalledTimes(1));
    await user.type(screen.getByPlaceholderText("Buscar por nombre, RUT o teléfono"), "Zoe");
    await user.click(screen.getByText("Buscar"));
    await waitFor(() => expect(pacientesApi.list).toHaveBeenLastCalledWith({ q: "Zoe" }));
  });

  it("muestra un error si falla la carga de pacientes", async () => {
    pacientesApi.list.mockRejectedValue(new Error("network"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los pacientes."
    );
  });

  it("muestra y oculta el formulario de nuevo paciente", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.queryByText("Crear")).not.toBeInTheDocument();
    await user.click(screen.getByText("Nuevo paciente"));
    expect(screen.getByText("Crear")).toBeInTheDocument();
    await user.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Crear")).not.toBeInTheDocument();
  });

  it("crea un paciente y navega a su detalle", async () => {
    const user = userEvent.setup();
    pacientesApi.create.mockResolvedValue({ data: { id: 42 } });
    renderPage();
    await user.click(screen.getByText("Nuevo paciente"));
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.click(screen.getByText("Crear"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/staff/pacientes/42"));
  });

  it("permite ingresar fecha de nacimiento al crear un paciente", async () => {
    const user = userEvent.setup();
    pacientesApi.create.mockResolvedValue({ data: { id: 42 } });
    renderPage();
    await user.click(screen.getByText("Nuevo paciente"));
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Fecha de nacimiento"), "2000-01-01");
    await user.click(screen.getByText("Crear"));
    await waitFor(() => expect(pacientesApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ fecha_nacimiento: "2000-01-01" })
    ));
  });

  it("muestra un error si la creacion falla", async () => {
    const user = userEvent.setup();
    pacientesApi.create.mockRejectedValue(new Error("rut repetido"));
    renderPage();
    await user.click(screen.getByText("Nuevo paciente"));
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("RUT"), "1-9");
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.click(screen.getByText("Crear"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo crear el paciente (revisa que el RUT no esté repetido)."
    );
  });
});
