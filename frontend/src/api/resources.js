import client from "./client";

export const meApi = {
  get: () => client.get("/me/"),
};

function crudResource(path) {
  return {
    list: (params) => client.get(`/${path}/`, { params }),
    get: (id) => client.get(`/${path}/${id}/`),
    create: (data) => client.post(`/${path}/`, data),
    update: (id, data) => client.patch(`/${path}/${id}/`, data),
    remove: (id) => client.delete(`/${path}/${id}/`),
  };
}

export const pacientesApi = crudResource("pacientes");
export const fichasClinicasApi = crudResource("fichas-clinicas");
export const profesionalesApi = crudResource("profesionales");
export const citasApi = crudResource("citas");
export const tratamientosApi = crudResource("tratamientos");
export const pagosApi = crudResource("pagos");
