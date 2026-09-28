const ETIQUETAS = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
  pagado: "Pagado",
  anulado: "Anulado",
  presupuestado: "Presupuestado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const TONOS = {
  confirmada: "verde",
  pagado: "verde",
  completada: "verde",
  completado: "verde",
  cancelada: "rojo",
  cancelado: "rojo",
  anulado: "rojo",
  no_asistio: "rojo",
  en_curso: "azul",
};

export default function Badge({ estado }) {
  const tono = TONOS[estado] || "ambar";
  return <span className={`badge badge-${tono}`}>{ETIQUETAS[estado] || estado}</span>;
}
