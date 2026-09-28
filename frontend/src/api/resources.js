import client from "./client";

export const meApi = {
  get: () => client.get("/me/"),
};

function crudResource(path) {
  // encodeURIComponent en el id: viene de datos del propio backend hoy,
  // pero sin esto un id con "/" o ".." podria alterar la ruta a la que
  // realmente pega la request (path traversal / SSRF del lado cliente).
  return {
    list: (params) => client.get(`/${path}/`, { params }),
    get: (id) => {
      const idSeguro = encodeURIComponent(id);
      return client.get(`/${path}/${idSeguro}/`);
    },
    create: (data) => client.post(`/${path}/`, data),
    update: (id, data) => {
      const idSeguro = encodeURIComponent(id);
      return client.patch(`/${path}/${idSeguro}/`, data);
    },
    remove: (id) => {
      const idSeguro = encodeURIComponent(id);
      return client.delete(`/${path}/${idSeguro}/`);
    },
  };
}

export const pacientesApi = crudResource("pacientes");
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
