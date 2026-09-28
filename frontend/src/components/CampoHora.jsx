export default function CampoHora({ value, onChange }) {
  return (
    <label>
      <span>Hora</span>
      <input type="time" value={value} onChange={onChange} required />
    </label>
  );
}
