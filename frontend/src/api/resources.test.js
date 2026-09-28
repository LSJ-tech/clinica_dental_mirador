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

  it("rechaza un id que no sea una PK entera antes de armar la url", () => {
    expect(() => pacientesApi.get("1/../2")).toThrow("Id inválido.");
    expect(() => pacientesApi.update("a b", {})).toThrow("Id inválido.");
    expect(() => pacientesApi.remove("a?b")).toThrow("Id inválido.");
    expect(client.get).not.toHaveBeenCalledWith(expect.stringContaining("/../"));
  });

  it("acepta un id que sea una PK entera (aunque venga como string)", () => {
    pacientesApi.get("42");
    expect(client.get).toHaveBeenCalledWith("/pacientes/42/");
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
