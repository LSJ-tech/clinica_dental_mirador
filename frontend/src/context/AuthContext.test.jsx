import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("../api/client", () => ({
  default: { post: vi.fn() },
}));
vi.mock("../api/resources", () => ({
  meApi: { get: vi.fn() },
}));

import client from "../api/client";
import { meApi } from "../api/resources";

function Consumidor() {
  const auth = useAuth();
  const [error, setError] = useState("");
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="autenticado">{String(auth.isAuthenticated)}</span>
      <span data-testid="staff">{String(auth.isStaff)}</span>
      <span data-testid="paciente">{auth.paciente ? auth.paciente.nombre : "ninguno"}</span>
      <span data-testid="error">{error}</span>
      <button
        onClick={() =>
          auth.login("+56911111111", "clave123").catch((e) => setError(e.message))
        }
      >
        Entrar
      </button>
      <button onClick={() => auth.logout()}>Salir</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("arranca sin token: no carga y no esta autenticado", async () => {
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("false");
  });

  it("con token guardado, consulta /me/ y actualiza isStaff/paciente", async () => {
    localStorage.setItem("access_token", "abc123");
    meApi.get.mockResolvedValueOnce({ data: { is_staff: true, paciente: null } });

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("staff")).toHaveTextContent("true");
  });

  it("si /me/ falla con el token guardado, cierra la sesion", async () => {
    localStorage.setItem("access_token", "invalido");
    meApi.get.mockRejectedValueOnce(new Error("401"));

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("autenticado")).toHaveTextContent("false");
  });

  it("login exitoso guarda los tokens y actualiza el estado", async () => {
    const user = userEvent.setup();
    client.post.mockResolvedValueOnce({ data: { access: "acc", refresh: "ref" } });
    meApi.get.mockResolvedValueOnce({
      data: { is_staff: false, paciente: { nombre: "Ana" } },
    });

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Entrar"));

    await waitFor(() => expect(screen.getByTestId("autenticado")).toHaveTextContent("true"));
    expect(screen.getByTestId("paciente")).toHaveTextContent("Ana");
    expect(localStorage.getItem("access_token")).toBe("acc");
    expect(localStorage.getItem("refresh_token")).toBe("ref");
  });

  it("login lanza si el backend responde un access vacio (sanitizarToken)", async () => {
    const user = userEvent.setup();
    client.post.mockResolvedValueOnce({ data: { access: "", refresh: "ref" } });

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    await user.click(screen.getByText("Entrar"));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Respuesta de login inválida.")
    );
    expect(screen.getByTestId("autenticado")).toHaveTextContent("false");
  });

  it("logout limpia tokens y estado", async () => {
    const user = userEvent.setup();
    localStorage.setItem("access_token", "abc");
    localStorage.setItem("refresh_token", "def");
    meApi.get.mockResolvedValueOnce({ data: { is_staff: true, paciente: null } });

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("staff")).toHaveTextContent("true"));

    await user.click(screen.getByText("Salir"));

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(screen.getByTestId("autenticado")).toHaveTextContent("false");
    expect(screen.getByTestId("staff")).toHaveTextContent("false");
  });
});
