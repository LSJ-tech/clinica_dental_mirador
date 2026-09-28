export default function CampoProfesional({ value, onChange, profesionales }) {
  return (
    <label>
      <span>Profesional</span>
      <select value={value} onChange={onChange} required>
        <option value="">Seleccionar...</option>
        {profesionales.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
