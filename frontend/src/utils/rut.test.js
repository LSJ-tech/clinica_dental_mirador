import { describe, it, expect } from "vitest";
import { normalizarRutParaLogin } from "./rut";

describe("normalizarRutParaLogin", () => {
  it("deja el mismo resultado para distintos formatos del mismo RUT", () => {
    for (const valor of ["11.111.111-1", "11111111-1", " 11.111.111 - 1 "]) {
      expect(normalizarRutParaLogin(valor)).toBe("11111111-1");
    }
  });

  it("sube a mayuscula el digito verificador K", () => {
    expect(normalizarRutParaLogin("6.666.666-k")).toBe("6666666-K");
  });

  it("no revienta con un valor vacio o muy corto", () => {
    expect(normalizarRutParaLogin("")).toBe("");
    expect(normalizarRutParaLogin("1")).toBe("1");
  });
});
