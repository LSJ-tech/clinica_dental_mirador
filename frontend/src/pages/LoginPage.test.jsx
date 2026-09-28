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
  it("arranca en modo paciente, con el campo RUT", () => {
    renderPage();
    expect(screen.getByLabelText("RUT")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("11.111.111-1")).toBeInTheDocument();
  });

  it("el tab 'Staff' cambia el campo a Usuario", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Staff" }));
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.queryByLabelText("RUT")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("11.111.111-1")).not.toBeInTheDocument();
  });

  it("cambiar de tab limpia lo escrito y el error previo", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("mal"));
    renderPage();
    await user.type(screen.getByLabelText("RUT"), "11.111.111-1");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Staff" }));
    expect(screen.getByLabelText("Usuario")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("login exitoso de paciente normaliza el RUT antes de enviarlo", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ is_staff: false });
    renderPage();
    await user.type(screen.getByLabelText("RUT"), "11.111.111-1");
    await user.type(screen.getByLabelText("Contraseña"), "clave123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(mockLogin).toHaveBeenCalledWith("11111111-1", "clave123");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/citas"));
  });

  it("login exitoso de staff (tab Staff) navega a /staff, sin tocar el usuario", async () => {
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

  it("login fallido en modo paciente muestra el mensaje de RUT", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("credenciales invalidas"));
    renderPage();
    await user.type(screen.getByLabelText("RUT"), "11.111.111-1");
    await user.type(screen.getByLabelText("Contraseña"), "malaclave");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "RUT o contraseña incorrectos."
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
