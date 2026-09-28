import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./client.js", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

import client from "./client.js";
import {
  meApi,
  pacientesApi,
  fichasClinicasApi,
  profesionalesApi,
  citasApi,
  tratamientosApi,
  pagosApi,
  horariosProfesionalApi,
  disponibilidadApi,
  reservasApi,
  cuentaApi,
} from "./resources.js";

describe("resources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("meApi.get pega a /me/", () => {
    meApi.get();
    expect(client.get).toHaveBeenCalledWith("/me/");
  });

  it.each([
    ["pacientes", pacientesApi],
    ["fichas-clinicas", fichasClinicasApi],
    ["profesionales", profesionalesApi],
    ["citas", citasApi],
    ["tratamientos", tratamientosApi],
    ["pagos", pagosApi],
    ["horarios-profesional", horariosProfesionalApi],
  ])("%s: list/create/get/update/remove pegan a las rutas correctas", (path, api) => {
    api.list({ q: "ana" });
    expect(client.get).toHaveBeenCalledWith(`/${path}/`, { params: { q: "ana" } });

    api.create({ nombre: "x" });
    expect(client.post).toHaveBeenCalledWith(`/${path}/`, { nombre: "x" });

    api.get(5);
    expect(client.get).toHaveBeenCalledWith(`/${path}/5/`);

    api.update(5, { nombre: "y" });
    expect(client.patch).toHaveBeenCalledWith(`/${path}/5/`, { nombre: "y" });

    api.remove(5);
    expect(client.delete).toHaveBeenCalledWith(`/${path}/5/`);
  });

  it("escapa un id peligroso con encodeURIComponent antes de armar la url", () => {
    pacientesApi.get("1/../2");
    expect(client.get).toHaveBeenCalledWith("/pacientes/1%2F..%2F2/");

    pacientesApi.update("a b", {});
    expect(client.patch).toHaveBeenCalledWith("/pacientes/a%20b/", {});

    pacientesApi.remove("a?b");
    expect(client.delete).toHaveBeenCalledWith("/pacientes/a%3Fb/");
  });

  it("disponibilidadApi.get pega a /disponibilidad/ con los params", () => {
    disponibilidadApi.get({ profesional: 1, fecha: "2026-01-05" });
    expect(client.get).toHaveBeenCalledWith("/disponibilidad/", {
      params: { profesional: 1, fecha: "2026-01-05" },
    });
  });

  it("reservasApi.create pega a /reservas/", () => {
    reservasApi.create({ nombre: "Ana" });
    expect(client.post).toHaveBeenCalledWith("/reservas/", { nombre: "Ana" });
  });

  it("cuentaApi.cambiarPassword pega a /cambiar-password/", () => {
    cuentaApi.cambiarPassword({ password_actual: "a", password_nueva: "b" });
    expect(client.post).toHaveBeenCalledWith("/cambiar-password/", {
      password_actual: "a",
      password_nueva: "b",
    });
  });
});
