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
  it("login exitoso de staff navega a /staff", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: true });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "clave123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(mockLogin).toHaveBeenCalledWith("+56911111111", "clave123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/staff"));
  });

  it("login exitoso de paciente navega a /citas", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: false });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Teléfono"), "+56911111111");
    await user.type(screen.getByLabelText("Contraseña"), "clave123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/citas"));
  });

  it("login fallido muestra un mensaje de error", async () => {
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
});
