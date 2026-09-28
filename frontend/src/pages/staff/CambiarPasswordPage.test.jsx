import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CambiarPasswordPage from "./CambiarPasswordPage";
import { cuentaApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  cuentaApi: { cambiarPassword: vi.fn() },
}));

describe("CambiarPasswordPage", () => {
  it("rechaza si las claves nuevas no coinciden, sin llamar al api", async () => {
    const user = userEvent.setup();
    render(<CambiarPasswordPage />);
    await user.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await user.type(screen.getByLabelText("Contraseña nueva"), "nueva123");
    await user.type(screen.getByLabelText("Repetir contraseña nueva"), "otra456");
    await user.click(screen.getByText("Guardar"));
    expect(screen.getByRole("alert")).toHaveTextContent("Las dos claves nuevas no coinciden.");
    expect(cuentaApi.cambiarPassword).not.toHaveBeenCalled();
  });

  it("muestra exito y limpia el formulario si el cambio funciona", async () => {
    const user = userEvent.setup();
    cuentaApi.cambiarPassword.mockResolvedValue({});
    render(<CambiarPasswordPage />);
    await user.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await user.type(screen.getByLabelText("Contraseña nueva"), "nueva123456");
    await user.type(screen.getByLabelText("Repetir contraseña nueva"), "nueva123456");
    await user.click(screen.getByText("Guardar"));
    expect(
      await screen.findByText("Contraseña actualizada correctamente.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
  });

  it("muestra el mensaje de error del backend para password_actual", async () => {
    const user = userEvent.setup();
    cuentaApi.cambiarPassword.mockRejectedValue({
      response: { data: { password_actual: ["La contraseña actual no es correcta."] } },
    });
    render(<CambiarPasswordPage />);
    await user.type(screen.getByLabelText("Contraseña actual"), "mala");
    await user.type(screen.getByLabelText("Contraseña nueva"), "nueva123456");
    await user.type(screen.getByLabelText("Repetir contraseña nueva"), "nueva123456");
    await user.click(screen.getByText("Guardar"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La contraseña actual no es correcta."
    );
  });

  it("muestra un mensaje generico si la respuesta no trae detalle", async () => {
    const user = userEvent.setup();
    cuentaApi.cambiarPassword.mockRejectedValue({ response: { data: {} } });
    render(<CambiarPasswordPage />);
    await user.type(screen.getByLabelText("Contraseña actual"), "mala");
    await user.type(screen.getByLabelText("Contraseña nueva"), "nueva123456");
    await user.type(screen.getByLabelText("Repetir contraseña nueva"), "nueva123456");
    await user.click(screen.getByText("Guardar"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cambiar la contraseña."
    );
  });
});
