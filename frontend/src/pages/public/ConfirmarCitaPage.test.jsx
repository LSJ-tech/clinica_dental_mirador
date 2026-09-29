import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ConfirmarCitaPage from "./ConfirmarCitaPage";
import { confirmarCitaApi } from "../../api/resources";

vi.mock("../../api/resources", () => ({
  confirmarCitaApi: { get: vi.fn() },
}));

function renderConToken(token) {
  return render(
    <MemoryRouter initialEntries={[`/confirmar-cita/${token}`]}>
      <Routes>
        <Route path="/confirmar-cita/:token" element={<ConfirmarCitaPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ConfirmarCitaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra la confirmación cuando el token es válido", async () => {
    confirmarCitaApi.get.mockResolvedValue({
      data: { estado: "confirmada", fecha: "2026-02-01", hora: "10:00:00", profesional_nombre: "Dra. Soto" },
    });
    renderConToken("abc:def:ghi");
    expect(await screen.findByText("¡Listo! Tu hora quedó confirmada.")).toBeInTheDocument();
    expect(screen.getByText("Dra. Soto")).toBeInTheDocument();
    expect(confirmarCitaApi.get).toHaveBeenCalledWith("abc:def:ghi");
  });

  it("muestra el mensaje de error cuando el token es inválido", async () => {
    confirmarCitaApi.get.mockRejectedValue({
      response: { data: { detail: "Este enlace no es válido o ya expiró." } },
    });
    renderConToken("token-malo");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Este enlace no es válido o ya expiró."
    );
  });

  it("muestra el estado correspondiente cuando la cita ya estaba cancelada", async () => {
    confirmarCitaApi.get.mockResolvedValue({
      data: { estado: "cancelada", fecha: "2026-02-01", hora: "10:00:00", profesional_nombre: "Dra. Soto" },
    });
    renderConToken("abc:def:ghi");
    expect(await screen.findByText("Esta hora ya fue cancelada.")).toBeInTheDocument();
  });
});
