import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  it("arranca en modo paciente, con el campo Telefono", () => {
    renderPage();
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+56 9 1234 5678")).toBeInTheDocument();
  });

  it("el tab 'Staff' cambia el campo a Usuario", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Staff" }));
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("+56 9 1234 5678")).not.toBeInTheDocument();
  });

  it("cambiar de tab limpia lo escrito y el error previo", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("mal"));
    renderPage();
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Staff" }));
    expect(screen.getByLabelText("Usuario")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("login exitoso de paciente (tab por defecto) navega a /citas", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: false });
    renderPage();
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "clave123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(mockLogin).toHaveBeenCalledWith("+56911111111", "clave123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/citas"));
  });

  it("login exitoso de staff (tab Staff) navega a /staff", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: true });
    renderPage();
    await user.click(screen.getByRole("button", { name: "Staff" }));
    await user.type(screen.getByLabelText("Usuario"), "mjauregui");
    await user.type(screen.getByLabelText("Contraseña"), "mirador2026");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(mockLogin).toHaveBeenCalledWith("mjauregui", "mirador2026");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/staff"));
  });

  it("login fallido en modo paciente muestra el mensaje de telefono", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("credenciales invalidas"));
    renderPage();
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Teléfono o contraseña incorrectos."
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("login fallido en modo staff muestra el mensaje de usuario", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("credenciales invalidas"));
    renderPage();
    await user.click(screen.getByRole("button", { name: "Staff" }));
    await user.type(screen.getByLabelText("Usuario"), "mjauregui");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuario o contraseña incorrectos."
    );
  });
});
