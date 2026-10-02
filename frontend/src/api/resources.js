import client from "./client";

export const meApi = {
  get: () => client.get("/me/"),
};

// Los ids de este backend son siempre PK enteras de Django. Se valida
// contra ese formato exacto (en vez de solo escapar con
// encodeURIComponent) porque el id viene de una respuesta del backend:
// si ese backend se viera comprometido, un id con "/" o ".." podria
// alterar la ruta a la que realmente pega la request (path traversal /
// SSRF del lado cliente) -- encodear no lo evita, exigir el formato si.
function idValidado(id) {
  const valor = String(id);
  if (!/^\d+$/.test(valor)) {
    throw new Error("Id inválido.");
  }
  return valor;
}

function crudResource(path) {
  return {
    list: (params) => client.get(`/${path}/`, { params }),
    get: (id) => {
      const idSeguro = idValidado(id);
      return client.get(`/${path}/${idSeguro}/`);
    },
    create: (data) => client.post(`/${path}/`, data),
    update: (id, data) => {
      const idSeguro = idValidado(id);
      return client.patch(`/${path}/${idSeguro}/`, data);
    },
    remove: (id) => {
      const idSeguro = idValidado(id);
      return client.delete(`/${path}/${idSeguro}/`);
    },
  };
}

export const pacientesApi = {
  ...crudResource("pacientes"),
  resetearPassword: (id) => {
    const idSeguro = idValidado(id);
    return client.post(`/pacientes/${idSeguro}/resetear_password/`);
  },
};
export const fichasClinicasApi = crudResource("fichas-clinicas");
export const profesionalesApi = crudResource("profesionales");
export const citasApi = crudResource("citas");
export const tratamientosApi = crudResource("tratamientos");
export const pagosApi = crudResource("pagos");
export const horariosProfesionalApi = crudResource("horarios-profesional");

export const disponibilidadApi = {
  get: (params) => client.get("/disponibilidad/", { params }),
};

export const reservasApi = {
  create: (data) => client.post("/reservas/", data),
};

export const cuentaApi = {
  cambiarPassword: (data) => client.post("/cambiar-password/", data),
};

export const recordatoriosApi = {
  enviar: () => client.post("/recordatorios/enviar/"),
};

// El token no es un id de recurso propio (lo genera django.core.signing,
// no idValidado): puede traer "-", "_" y ":" en base64url, formato
// distinto al de los ids numéricos del resto de la API.
function tokenValidado(token) {
  const valor = String(token);
  if (!/^[A-Za-z0-9_-]+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/.test(valor)) {
    throw new Error("Enlace de confirmación inválido.");
  }
  return valor;
}

export const confirmarCitaApi = {
  get: (token) => client.get(`/confirmar-cita/${tokenValidado(token)}/`),
};
