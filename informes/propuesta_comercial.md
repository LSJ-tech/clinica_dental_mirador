# Propuesta Sistema de Gestión — Clínica Dental El Mirador

2026-09-27 · Preparado por Logan (DevQuad)

> Documento vivo (editable, comentable): https://claude.ai/code/artifact/d8969af2-5a20-4bba-ab64-ab601943b0cb

## Resumen del proyecto

La clínica ya cuenta con reserva de hora online, lo cual cubre el primer paso del recorrido del paciente. Proponemos un **sistema de gestión clínica completo** que centraliza lo que hoy probablemente se maneja en papel, Excel o herramientas separadas: fichas clínicas, historial de tratamientos, agenda por dentista/box, recordatorios automáticos, pagos y reportes de gestión.

A diferencia de un sistema de reservas aislado, este software queda integrado a la operación diaria de la clínica y a los datos de cada paciente, con un perfil de acceso propio para cada uno.

## Prestaciones incluidas

- Ficha clínica digital por paciente (historial, tratamientos, odontograma)
- Perfil de acceso propio para cada paciente: próximas horas, historial de tratamientos y estado de pagos
- Agenda integrada por dentista/box, sincronizada con las reservas online existentes
- Recordatorios automáticos de hora integrados directamente con el WhatsApp Business de la clínica (sin necesidad de un número adicional) para reducir inasistencias
- Registro de pagos y estado de cuenta por paciente
- Panel de reportes para la dirección de la clínica
- Soporte y ajustes durante la implementación
- **Cómo funciona la integración con WhatsApp Business:** los recordatorios se envían mediante la API oficial de WhatsApp Business (Meta), manteniendo el mismo número que la clínica ya usa en la app para atender pacientes (coexistencia app + API). Los mensajes usan plantillas pre-aprobadas por Meta (ej. "Te recordamos tu hora el {{fecha}} a las {{hora}}") y el envío queda automatizado desde el sistema, sin costo relevante adicional para el volumen de una clínica de este tamaño.

## Costos

Proponemos un modelo de **implementación inicial + mensualidad**, en vez de un pago único: la clínica invierte menos de entrada y la mensualidad cubre hosting, soporte y actualizaciones continuas.

| Propuesta | Incluye | Implementación (pago único) | Mensualidad |
| --- | --- | --- | --- |
| Propuesta 1 — Básica | Ficha clínica, perfil de paciente, agenda, recordatorios | $900.000 – $1.400.000 CLP | $45.000 – $55.000 CLP/mes |
| Propuesta 2 — Ampliada | Todo lo anterior + pagos online y reportes avanzados de gestión | $1.500.000 – $2.200.000 CLP | $60.000 – $80.000 CLP/mes |

El rango final depende del número de dentistas/usuarios y de si se integra con el sistema de reservas que la clínica ya utiliza. La mensualidad incluye un ambiente de hosting dedicado (no compartido con otros clientes), lo que da mayor seguridad para datos de salud. El costo de envío de recordatorios por WhatsApp Business (cobrado por Meta, aproximadamente CLP $800 – $2.400 al mes según volumen) también queda incluido en la mensualidad, sin cobro adicional para la clínica.

## Tiempo de implementación

| Etapa | Duración estimada | Entregable |
| --- | --- | --- |
| Levantamiento y definición de alcance | 1 semana | Módulos confirmados y plan de trabajo |
| Desarrollo backend (API y modelos) | 2 – 3 semanas | API funcional en ambiente de pruebas |
| Desarrollo frontend (agenda, fichas, perfil de paciente) | 2 – 3 semanas | Interfaz conectada al API |
| Integración de recordatorios automáticos por WhatsApp | 1 semana | Plantillas aprobadas y envío automático funcionando |
| Migración de datos existentes (si aplica) | 3 – 5 días | Pacientes e historial cargados |
| Capacitación al equipo y salida a producción | 3 – 5 días | Sistema operativo para la clínica |

Tiempo total estimado: **7 a 10 semanas** desde que se confirma el alcance, según la propuesta elegida.

## Impacto en la clínica

- Menos tiempo administrativo para secretaria y dentistas al reemplazar planillas y registros en papel por un solo sistema
- Menos inasistencias gracias a los recordatorios automáticos de hora
- Mejor trazabilidad clínica y legal de cada paciente, con historial siempre disponible
- Información de gestión (pacientes nuevos, tratamientos más solicitados, ocupación de agenda) para tomar decisiones
- Experiencia más moderna para el paciente, con acceso directo a su propia información

## Beneficios clave

- Todo centralizado en un solo sistema, sin depender de Excel, WhatsApp y papel por separado
- Cada paciente con su propio perfil, lo que da más transparencia y confianza
- Datos alojados en un ambiente propio y siempre disponible (sin tiempos de espera al cargar), con la seguridad que corresponde a información de salud
- Sistema escalable a medida que crece la clínica
- Acompañamiento de DevQuad post-lanzamiento, incluido en la mensualidad
- Se aprovecha el WhatsApp Business que ya tiene la clínica, sin contratar un servicio de mensajería aparte

## Próximos pasos

1. Reunión de 15-20 minutos para revisar necesidades específicas de la clínica
2. Definición de la propuesta final (1 o 2) y ajustes de alcance si corresponde
3. Confirmación e inicio de la etapa de levantamiento

**Contacto:** DevQuad — devquad.cl
