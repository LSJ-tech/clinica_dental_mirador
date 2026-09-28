// Deja el RUT en el mismo formato "12345678-9" que usa el backend como
// username del paciente (ver normalizar_rut en validators.py). No valida
// el digito verificador aca: si esta mal, el login simplemente falla con
// el mismo mensaje de "RUT o contraseña incorrectos" que cualquier otro
// dato erroneo, no hace falta duplicar esa validacion en el cliente.
export function normalizarRutParaLogin(valor) {
  const limpio = (valor || "").toUpperCase().replace(/[.\s-]/g, "");
  if (limpio.length < 2) return limpio;
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}
