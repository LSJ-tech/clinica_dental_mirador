import { describe, it, expect, vi, beforeEach } from "vitest";

const interceptors = { request: [], response: [] };

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: (fn) => interceptors.request.push(fn) },
        response: {
          use: (onSuccess, onError) => interceptors.response.push({ onSuccess, onError }),
        },
      },
    })),
  },
}));

describe("client (axios interceptors)", () => {
  beforeEach(() => {
    interceptors.request.length = 0;
    interceptors.response.length = 0;
    localStorage.clear();
    vi.resetModules();
    Object.defineProperty(window, "location", {
      value: { pathname: "/staff", href: "" },
      writable: true,
      configurable: true,
    });
  });

  it("agrega el header Authorization si hay token guardado", async () => {
    localStorage.setItem("access_token", "abc123");
    await import("./client.js");
    const config = { headers: {} };
    const resultado = interceptors.request[0](config);
    expect(resultado.headers.Authorization).toBe("Bearer abc123");
  });

  it("devuelve respuestas exitosas sin modificarlas", async () => {
    await import("./client.js");
    const respuesta = { data: { ok: true } };
    expect(interceptors.response[0].onSuccess(respuesta)).toBe(respuesta);
  });

  it("no agrega header Authorization si no hay token", async () => {
    await import("./client.js");
    const config = { headers: {} };
    const resultado = interceptors.request[0](config);
    expect(resultado.headers.Authorization).toBeUndefined();
  });

  it("limpia los tokens y redirige a /login en un 401 fuera de /login", async () => {
    localStorage.setItem("access_token", "abc");
    localStorage.setItem("refresh_token", "xyz");
    await import("./client.js");
    const error = { response: { status: 401 } };
    await expect(interceptors.response[0].onError(error)).rejects.toBe(error);
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("no redirige de nuevo si ya esta en /login", async () => {
    window.location.pathname = "/login";
    await import("./client.js");
    const error = { response: { status: 401 } };
    await expect(interceptors.response[0].onError(error)).rejects.toBe(error);
    expect(window.location.href).toBe("");
  });

  it("propaga errores que no son 401 sin tocar el localStorage", async () => {
    localStorage.setItem("access_token", "abc");
    await import("./client.js");
    const error = { response: { status: 500 } };
    await expect(interceptors.response[0].onError(error)).rejects.toBe(error);
    expect(localStorage.getItem("access_token")).toBe("abc");
  });

  it("propaga un error sin response (ej. de red) sin lanzar", async () => {
    await import("./client.js");
    const error = {};
    await expect(interceptors.response[0].onError(error)).rejects.toBe(error);
  });
});
