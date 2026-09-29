import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";
import "./landing.css";

export default function PoliticaCookiesPage() {
  return (
    <div className="cs-landing">
      <PublicNav />

      <section>
        <div className="cs-container cs-legal-body">
          <span className="cs-topper">Legal</span>
          <h2 className="cs-title">Política de Cookies</h2>
          <p className="cs-actualizado">Última actualización: 29 de septiembre de 2026</p>

          <p>
            Este sitio no utiliza cookies de rastreo, analítica ni publicidad. A continuación
            explicamos, de forma transparente, qué usamos en su lugar y qué elementos externos
            podrían generar cookies fuera de nuestro control.
          </p>

          <h3>1. Cómo mantenemos tu sesión iniciada</h3>
          <p>
            En vez de cookies, este Sistema usa el almacenamiento local de tu navegador
            (localStorage) para guardar el token que te mantiene con la sesión iniciada cuando
            entras a tu cuenta. Ese token vive solo en tu dispositivo, no se comparte con
            terceros, y se elimina automáticamente cuando cierras sesión.
          </p>

          <h3>2. Cookies técnicas de Django</h3>
          <p>
            El panel de administración interno de Django (usado solo por el equipo técnico, no
            por pacientes ni staff de la Clínica en su uso normal) puede generar cookies técnicas
            de sesión y seguridad. No están relacionadas con el uso del portal de pacientes ni con
            fines de rastreo.
          </p>

          <h3>3. Mapa embebido</h3>
          <p>
            La página de inicio incluye un mapa de Google Maps embebido para mostrar la ubicación
            de la Clínica. Al cargarse, ese mapa puede generar sus propias cookies según la
            política de privacidad de Google, fuera del control de la Clínica.
          </p>

          <h3>4. Cómo eliminar estos datos</h3>
          <p>
            Puedes borrar el almacenamiento local de tu navegador en cualquier momento desde su
            configuración de privacidad; esto cerrará tu sesión en el Sistema la próxima vez que
            lo abras.
          </p>

          <h3>5. Cambios a esta política</h3>
          <p>
            Si en el futuro incorporamos herramientas de analítica o cookies de terceros,
            actualizaremos esta página y, de corresponder, pediremos tu consentimiento antes de
            activarlas.
          </p>

          <h3>6. Contacto</h3>
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
