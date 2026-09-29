import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";
import "./landing.css";

export default function TerminosCondicionesPage() {
  return (
    <div className="cs-landing">
      <PublicNav />

      <section>
        <div className="cs-container cs-legal-body">
          <span className="cs-topper">Legal</span>
          <h2 className="cs-title">Términos y Condiciones de Uso</h2>
          <p className="cs-actualizado">Última actualización: 29 de septiembre de 2026</p>

          <p>
            Estos Términos y Condiciones regulan el uso del sistema de reserva y gestión clínica
            de Clínica Dental El Mirador (el "Sistema"), disponible en este sitio web. Al usar el
            Sistema para reservar una hora, crear una cuenta o acceder a tu información, aceptas
            estos términos.
          </p>

          <h3>1. Qué es el Sistema (y qué no es)</h3>
          <p>
            El Sistema te permite reservar horas, ver tu ficha clínica y tus pagos, y a la Clínica
            gestionar su agenda y sus pacientes. No es un servicio de diagnóstico ni de atención
            médica en línea, ni reemplaza una consulta presencial. Ante una urgencia dental,
            comunícate directamente al +569 5604 3960 o acude al servicio de urgencia que
            corresponda; no uses este Sistema para situaciones urgentes.
          </p>

          <h3>2. Reservas de hora</h3>
          <ul>
            <li>Toda reserva realizada desde la web pública queda en estado "pendiente" hasta que la Clínica la confirme.</li>
            <li>La disponibilidad mostrada puede cambiar si otro paciente reserva el mismo horario primero.</li>
            <li>La Clínica puede reagendar o cancelar una hora por motivos de fuerza mayor, avisándote por los medios de contacto que nos hayas dado.</li>
            <li>Te recomendamos llegar con anticipación y avisar con tiempo si no podrás asistir.</li>
          </ul>

          <h3>3. Tu cuenta</h3>
          <ul>
            <li>Para crear una cuenta debes usar tu RUT y datos verídicos; no está permitido reservar o registrarse a nombre de un tercero sin su autorización.</li>
            <li>Eres responsable de mantener tu contraseña en secreto y de toda actividad realizada desde tu cuenta.</li>
            <li>Si sospechas un uso no autorizado de tu cuenta, avísanos de inmediato.</li>
          </ul>

          <h3>4. Pagos</h3>
          <p>
            El Sistema no procesa pagos en línea: los pagos se acuerdan y registran directamente
            con la Clínica según los medios que esta disponga (efectivo, tarjeta o transferencia).
            El registro de pagos en el Sistema es solo un respaldo administrativo de lo pagado.
          </p>

          <h3>5. Uso aceptable</h3>
          <p>No está permitido usar el Sistema para:</p>
          <ul>
            <li>Ingresar información falsa o suplantar la identidad de otra persona.</li>
            <li>Intentar acceder a datos o cuentas de otros pacientes sin autorización.</li>
            <li>Interferir con el funcionamiento normal del Sistema.</li>
          </ul>

          <h3>6. Disponibilidad del servicio</h3>
          <p>
            Hacemos nuestro mejor esfuerzo para que el Sistema esté disponible de forma
            permanente, pero puede haber interrupciones por mantenimiento u otras causas fuera de
            nuestro control. No garantizamos disponibilidad ininterrumpida.
          </p>

          <h3>7. Propiedad intelectual</h3>
          <p>
            El contenido, diseño y funcionamiento de este sitio pertenecen a Clínica Dental El
            Mirador y a su proveedor de desarrollo. No está permitido copiar o reutilizar el
            contenido sin autorización.
          </p>

          <h3>8. Modificaciones a estos términos</h3>
          <p>
            Podemos actualizar estos Términos y Condiciones en cualquier momento. La versión
            vigente es siempre la publicada en esta página, con su fecha de actualización.
          </p>

          <h3>9. Ley aplicable</h3>
          <p>
            Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia
            se someterá a los tribunales competentes.
          </p>

          <h3>10. Contacto</h3>
          <p>
            Para consultas sobre estos términos, escríbenos a{" "}
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
