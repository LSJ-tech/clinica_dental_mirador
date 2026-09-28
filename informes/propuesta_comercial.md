# Propuesta Sistema de Gestión — Clínica Dental El Mirador

2026-09-27 · Preparado por Logan (DevQuad)

> **Pruébala en vivo:** [clinicadentalelmirador.devquad.cl](https://clinicadentalelmirador.devquad.cl) — ya puedes navegar la página pública, ver el equipo y hacer una reserva de prueba. Para ver el portal del paciente o el panel de administración, coordinamos el acceso por un canal aparte.

## Resumen del proyecto

Construimos y pusimos en línea un sistema de gestión clínica para Clínica Dental El Mirador: reserva de hora pública, fichas clínicas digitales, agenda por dentista, portal propio para cada paciente y panel de administración para el equipo. Ya está funcionando en el link de arriba, no es un mockup.

A diferencia de un sistema de reservas aislado (como el que la clínica usa hoy), este software integra la reserva pública, la operación diaria del equipo y los datos de cada paciente en un solo lugar, con un perfil de acceso propio para cada uno.

## Tu sitio actual vs. nuestro sistema

| Funcionalidad | Sitio actual (Reservo) | Nuestro sistema |
| --- | --- | --- |
| Reserva de hora online | Sí | Sí |
| Ficha clínica digital | No | Sí |
| Portal propio del paciente (RUT + clave) | No | Sí |
| Agenda integrada con los datos clínicos | Externo / limitado | Sí |
| Panel de administración propio de la clínica | No | Sí |
| Registro de pagos y tratamientos | No | Sí |
| Hosting dedicado (no compartido) | No | Sí |
| Recordatorios automáticos por WhatsApp | No | Pendiente |
| Reportes de gestión | No | Pendiente |

Hoy la reserva online de la clínica corre en Reservo, una herramienta externa que no conoce la ficha clínica, los pagos ni la agenda real de cada dentista. Nuestro sistema reemplaza eso con una plataforma propia de la clínica, donde todo vive conectado.

## Prestaciones incluidas

- Página web pública con la información real de la clínica, el equipo y la ubicación
- Reserva de hora pública en línea (evaluación inicial), sin llamar, con validación de horario por dentista y sin choques de agenda
- Cuenta propia para cada paciente usando su RUT (se puede crear al momento de reservar): ve sus citas, su ficha clínica y sus pagos
- Ficha clínica digital por paciente (historial, notas clínicas, tratamientos)
- Agenda por dentista, con horario semanal propio configurable y prevención de doble reserva
- Registro de tratamientos y pagos por paciente (registro manual del staff; no es pasarela de pago online)
- Panel de administración para el equipo, con cuenta propia para cada integrante y cambio de clave
- Panel con indicadores básicos del día a día (citas de hoy, total de pacientes)
- Soporte y ajustes durante la puesta en marcha

**Pendiente, no incluido en el costo base (ver Costos):** recordatorios automáticos de hora por WhatsApp Business y reportes de gestión avanzados.

## Costos

El sistema base descrito arriba ya está implementado y en línea. Proponemos un modelo de **puesta en producción + mensualidad**: la mensualidad cubre hosting dedicado, soporte y actualizaciones continuas. Los recordatorios por WhatsApp y los reportes avanzados quedan como adicionales opcionales, con su propio costo aparte.

| Concepto | Incluye | Puesta en producción (pago único) | Mensualidad |
| --- | --- | --- | --- |
| Sistema de gestión (ya implementado) | Todo lo listado en Prestaciones incluidas | $600.000 – $900.000 CLP | $45.000 – $60.000 CLP/mes |
| Adicional — Recordatorios por WhatsApp Business | Envío automático de recordatorios de hora por el WhatsApp que ya usa la clínica | $250.000 – $400.000 CLP | + $10.000 – $20.000 CLP/mes |
| Adicional — Reportes avanzados de gestión | Indicadores de tratamientos más solicitados, ocupación de agenda y pacientes nuevos | $300.000 – $500.000 CLP | Sin costo adicional |

El rango de la puesta en producción depende de ajustes finos que pida la clínica antes de salir a producción (branding, contenidos, integraciones puntuales). La mensualidad incluye un ambiente de hosting dedicado (no compartido con otros clientes), lo que da mayor seguridad para datos de salud.

El costo de envío por WhatsApp Business (cobrado por Meta, aproximadamente CLP $800 – $2.400 al mes según volumen) queda incluido en la mensualidad adicional de ese módulo, sin cobro extra ni sorpresas para la clínica.

## Tiempo de implementación

| Adicional | Duración estimada | Entregable |
| --- | --- | --- |
| Recordatorios automáticos por WhatsApp | 1 – 2 semanas | Plantillas aprobadas por Meta y envío automático funcionando |
| Reportes avanzados de gestión | 1 semana | Panel de indicadores ampliado |

El sistema base ya está completo y en producción (puedes probarlo en el link de arriba). Tiempo estimado para sumar **ambos adicionales**: **2 a 3 semanas**, solo si la clínica decide incorporarlos.

## Impacto en la clínica

- Menos tiempo administrativo para secretaria y dentistas al reemplazar planillas y registros en papel por un solo sistema
- Mejor trazabilidad clínica y legal de cada paciente, con historial siempre disponible
- Experiencia más moderna para el paciente: reserva en línea y acceso directo a su propia información
- Menos inasistencias y mejor información de gestión una vez sumados los adicionales de WhatsApp y reportes

## Beneficios clave

- Todo centralizado en un solo sistema, sin depender de Excel y papel por separado
- Cada paciente con su propio perfil, lo que da más transparencia y confianza
- Datos alojados en un ambiente propio y siempre disponible, con la seguridad que corresponde a información de salud
- Sistema escalable a medida que crece la clínica
- Acompañamiento de DevQuad post-lanzamiento, incluido en la mensualidad
- Los adicionales (WhatsApp, reportes) se suman cuando la clínica lo decida, sin rehacer nada de lo ya construido

## Próximos pasos

1. Prueba el sistema en el link de arriba (página pública y reserva de hora)
2. Reunión de 15-20 minutos para ver juntos el portal del paciente y el panel de administración, y resolver dudas
3. Decides si sumas los adicionales (WhatsApp, reportes) y confirmamos la puesta en producción final

**Contacto:** DevQuad — devquad.cl
