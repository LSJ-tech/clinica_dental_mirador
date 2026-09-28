import Badge from "./Badge";

export default function TablaPagos({ pagos }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Monto</th>
          <th>Medio</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {pagos.map((p) => (
          <tr key={p.id}>
            <td>{p.fecha}</td>
            <td>${p.monto}</td>
            <td>{p.medio_pago}</td>
            <td>
              <Badge estado={p.estado} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
