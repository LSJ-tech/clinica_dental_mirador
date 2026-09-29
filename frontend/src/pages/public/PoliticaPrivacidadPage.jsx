import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";
import "./landing.css";

export default function PoliticaPrivacidadPage() {
  return (
    <div className="cs-landing">
      <PublicNav />

      <section>
        <div className="cs-container cs-legal-body">
          <span className="cs-topper">Legal</span>
          <h2 className="cs-title">Política de Privacidad y Seguridad de Datos</h2>
          <p className="cs-actualizado">Última actualización: 29 de septiembre de 2026</p>

          <p>
            Clínica Dental El Mirador ("la Clínica"), con domicilio en El Mirador #459 (Sitio
            17-E), Casablanca, es la responsable del tratamiento de los datos personales que
            recolecta a través de este sistema de reserva y gestión clínica (el "Sistema"). Esta
            política explica qué datos recopilamos, para qué los usamos y qué derechos tienes
            sobre ellos, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y demás
            normativa chilena aplicable.
          </p>

          <h3>1. Datos que recopilamos</h3>
          <p>Según cómo uses el Sistema, podemos recopilar:</p>
          <ul>
            <li>
              <strong>Datos de identificación:</strong> nombre, RUT, teléfono y fecha de
              nacimiento.
            </li>
            <li>
              <strong>Datos de agendamiento:</strong> profesional elegido, fecha, hora, box
              asignado, estado de la cita y el motivo de consulta que escribas al reservar.
            </li>
            <li>
              <strong>Datos de salud (sensibles):</strong> ficha clínica, historial, odontograma y
              notas clínicas registradas por el equipo de la Clínica.
            </li>
            <li>
              <strong>Datos de tratamientos y pagos:</strong> tipo de tratamiento, costo, monto y
              medio de pago (efectivo, tarjeta, transferencia u otro). No almacenamos números de
              tarjeta ni datos bancarios: los pagos se registran manualmente por el staff, el
              Sistema no procesa pagos en línea.
            </li>
            <li>
              <strong>Cuenta de acceso:</strong> si creas una cuenta para el portal del paciente,
              tu nombre de usuario (tu RUT) y tu contraseña, almacenada siempre cifrada.
            </li>
          </ul>

          <h3>2. Para qué usamos tus datos</h3>
          <ul>
            <li>Gestionar tu reserva y el agendamiento con el profesional correspondiente.</li>
            <li>Prestarte atención odontológica y mantener tu ficha clínica al día.</li>
            <li>Registrar tratamientos y pagos asociados a tu atención.</li>
            <li>Contactarte para confirmar, recordar o reagendar una hora.</li>
            <li>Cumplir obligaciones legales y sanitarias que apliquen a la Clínica.</li>
          </ul>
          <p>No vendemos ni compartimos tus datos con terceros para fines comerciales o publicitarios.</p>

          <h3>3. Datos sensibles y acceso restringido</h3>
          <p>
            Tu ficha clínica se almacena de forma separada del resto de tus datos justamente por
            ser información de salud, y solo el personal autorizado de la Clínica puede acceder a
            ella. Tú puedes ver siempre tu propia ficha desde tu portal de paciente; el personal
            administrativo sin rol clínico no tiene acceso a ese contenido.
          </p>

          <h3>4. Cómo protegemos tus datos</h3>
          <ul>
            <li>El Sistema opera sobre una conexión cifrada (HTTPS).</li>
            <li>Los datos se alojan en un ambiente de hosting dedicado, no compartido con otros clientes.</li>
            <li>El acceso está segmentado por perfil: paciente, staff y administrador, cada uno con permisos distintos.</li>
            <li>Las contraseñas se almacenan siempre cifradas, nunca en texto plano.</li>
          </ul>

          <h3>5. Cuánto tiempo conservamos tus datos</h3>
          <p>
            Conservamos tus datos mientras mantengas una relación activa con la Clínica, y tu
            ficha clínica por el plazo mínimo que exige la normativa de salud vigente en Chile.
            Puedes solicitar la eliminación de tus datos no clínicos en cualquier momento,
            conforme a la sección siguiente.
          </p>

          <h3>6. Tus derechos</h3>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, actualización y eliminación
            (derechos ARCO) sobre tus datos personales escribiendo a{" "}
            <a href="mailto:clinicadentalelmirador2020@gmail.com">
              clinicadentalelmirador2020@gmail.com
            </a>{" "}
            o llamando al +569 5604 3960. Responderemos tu solicitud dentro de un plazo razonable.
          </p>

          <h3>7. Menores de edad</h3>
          <p>
            Si el paciente es menor de edad, sus datos son ingresados y gestionados por su
            representante legal o apoderado.
          </p>

          <h3>8. Cambios a esta política</h3>
          <p>
            Si actualizamos esta política, publicaremos la nueva versión en esta misma página con
            su fecha de actualización.
          </p>

          <h3>9. Contacto</h3>
          <p>
            Ante cualquier duda sobre esta política, escríbenos a{" "}
            <a href="mailto:clinicadentalelmirador2020@gmail.com">
              clinicadentalelmirador2020@gmail.com
            </a>{" "}
            o llámanos al +569 5604 3960.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
