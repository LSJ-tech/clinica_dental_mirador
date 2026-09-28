export default function TablaTratamientos({ tratamientos }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Costo</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {tratamientos.map((t) => (
          <tr key={t.id}>
            <td>{t.tipo}</td>
            <td>${t.costo}</td>
            <td>{t.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
