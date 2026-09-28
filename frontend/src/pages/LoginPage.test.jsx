import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("LoginPage", () => {
  it("arranca en modo paciente, con el campo Telefono", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+56 9 1234 5678")).toBeInTheDocument();
  });

  it("el tab 'Soy del equipo' cambia el campo a Usuario", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByText("Soy del equipo"));
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.queryByLabelText("Teléfono")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("+56 9 1234 5678")).not.toBeInTheDocument();
  });

  it("cambiar de tab limpia lo escrito y el error previo", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("mal"));
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByText("Soy del equipo"));
    expect(screen.getByLabelText("Usuario")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("login exitoso de paciente (tab por defecto) navega a /citas", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: false });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "clave123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(mockLogin).toHaveBeenCalledWith("+56911111111", "clave123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/citas"));
  });

  it("login exitoso de staff (tab equipo) navega a /staff", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: true });
    render(<LoginPage />);
    await user.click(screen.getByText("Soy del equipo"));
    await user.type(screen.getByLabelText("Usuario"), "mjauregui");
    await user.type(screen.getByLabelText("Contraseña"), "mirador2026");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(mockLogin).toHaveBeenCalledWith("mjauregui", "mirador2026");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/staff"));
  });

  it("login fallido en modo paciente muestra el mensaje de telefono", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("credenciales invalidas"));
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Teléfono o contraseña incorrectos."
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("login fallido en modo equipo muestra el mensaje de usuario", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("credenciales invalidas"));
    render(<LoginPage />);
    await user.click(screen.getByText("Soy del equipo"));
    await user.type(screen.getByLabelText("Usuario"), "mjauregui");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuario o contraseña incorrectos."
    );
  });
});
