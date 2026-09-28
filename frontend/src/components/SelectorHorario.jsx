import { useEffect, useState } from "react";
import { disponibilidadApi } from "../api/resources";
import CampoHora from "./CampoHora";

// Reutiliza el mismo endpoint de disponibilidad que ya usa la reserva
// publica (ReservarPage), para que el staff vea el horario real del
// profesional en vez de escribir una hora a ciegas y enterarse recien
// al guardar si choca con otra cita o cae fuera de su horario.
export default function SelectorHorario({ profesional, fecha, value, onChange }) {
  const [slots, setSlots] = useState(null);

  useEffect(() => {
    setSlots(null);
    if (!profesional || !fecha) return;
    disponibilidadApi.get({ profesional, fecha }).then((r) => setSlots(r.data.slots));
  }, [profesional, fecha]);

  return (
    <div className="selector-horario">
      {profesional && fecha && (
        <div>
          <span className="selector-horario-label">Horario disponible ese día</span>
          {slots === null && <p className="selector-horario-cargando">Cargando disponibilidad...</p>}
          {slots?.length === 0 && (
            <p className="selector-horario-cargando">
              Sin horas libres configuradas ese día para este profesional.
            </p>
          )}
          {slots?.length > 0 && (
            <div className="slots-grid">
              {slots.map((hora) => (
                <button
                  key={hora}
                  type="button"
                  className={hora === value ? "slot slot-activo" : "slot"}
                  onClick={() => onChange(hora)}
                >
                  {hora}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <CampoHora value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
