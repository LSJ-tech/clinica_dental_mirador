# Informe Técnico — Sistema Gestión Clínica Dental

2026-09-27 · Preparado por Logan (DevQuad)

> Documento vivo (editable, comentable): https://claude.ai/code/artifact/6e3a80b9-be47-457c-8225-9ec5c810ac03

## Contexto y alcance

Este informe complementa la propuesta comercial enviada a Clínica Dental El Mirador (Casablanca). Importante: este es un desarrollo nuevo, no una extensión del código de PataAgenda — PataAgenda es un monolito Django con templates renderizados en servidor, sin API ni React, y su "integración" de WhatsApp es solo un link `wa.me` manual (botón que abre WhatsApp con el mensaje escrito, sin automático ni Cloud API). Para este proyecto sí construimos con **Django + DRF** en el backend y **React** en el frontend, reutilizando únicamente el patrón de infraestructura en Render (no el código) que ya usamos en PataAgenda.

Alcance de este documento: arquitectura, modelo de datos e integraciones (WhatsApp Business API). Costos y plazos comerciales están en la propuesta enviada al cliente, no se repiten aquí.

## Arquitectura general

*(Diagrama interactivo disponible en el documento vivo, sección "Arquitectura general" — resumen abajo.)*

- **Navegador** (paciente / staff clínica) → **Frontend React** (Render)
- **Frontend React** → **Backend Django/DRF** (Render)
- **Backend Django/DRF** → **PostgreSQL** (BD aislada por cliente, Render)
- **Backend Django/DRF** → **WhatsApp Cloud API** (Meta, servicio externo) — dispara los recordatorios automáticos

El frontend (React), el backend (Django/DRF) y la base de datos (PostgreSQL) corren en Render, en una instancia dedicada y aislada por cliente. El backend es el único componente que se comunica con la WhatsApp Cloud API de Meta, que es un servicio externo (no corre en nuestra infraestructura).

## Modelo de datos

| Entidad | Campos clave | Relación |
| --- | --- | --- |
| Paciente | nombre, RUT, contacto, fecha nacimiento | 1:1 con UsuarioPaciente (perfil de acceso) |
| UsuarioPaciente | credenciales de acceso, permisos | pertenece a un Paciente |
| FichaClinica | historial, odontograma, notas clínicas | pertenece a un Paciente |
| Profesional | nombre, especialidad, box asignado | atiende muchas Citas |
| Cita | fecha, hora, estado, box | vincula un Paciente con un Profesional |
| Tratamiento | tipo, costo, estado | pertenece a una FichaClinica, puede asociarse a una Cita |
| Pago | monto, fecha, medio de pago, estado | asociado a un Paciente y opcionalmente a un Tratamiento |

La FichaClinica y sus Tratamientos quedan separados de los datos de cuenta (UsuarioPaciente) para poder aplicar permisos más estrictos sobre la información de salud.

## Integración WhatsApp Business API

1. Registrar el número de la clínica en Meta Business Manager, activando **coexistencia** app + Cloud API (mantienen la app para uso manual, la API queda disponible para el backend).
2. Crear y enviar a aprobación las plantillas (`templates`) de tipo *utility* para recordatorios, ej. `Hola {{1}}, te recordamos tu hora el {{2}} a las {{3}} en Clínica Dental El Mirador.`
3. En el backend Django, un job programado (Celery beat o cron) recorre las Citas del día siguiente y dispara el envío del template correspondiente vía la Cloud API.
4. Registrar el estado de entrega (enviado, entregado, leído, fallido) que devuelve la API, asociado a cada Cita, para trazabilidad.
5. El costo de las conversaciones (Meta, categoría *utility*) se factura directo a DevQuad y queda incluido en la mensualidad del cliente, sin integración de facturación aparte.

Nota: esto es distinto de `gestion/whatsapp.py` en PataAgenda, que solo genera links `wa.me` manuales (sin costo ni automatización). Acá no aplica ese módulo ni ese patrón, se implementa la Cloud API desde cero.

## Infraestructura y seguridad

- **Hosting:** Render, en un Web Service + base de datos PostgreSQL propios de este cliente (no se comparte instancia ni base de datos con PataAgenda ni otros clientes).
- **Plan pagado (no free tier):** evita que el servicio "duerma" por inactividad, importante porque el sistema se usa en horario de atención.
- **Subdominio:** propuesta de `elmirador.devquad.cl` apuntando por CNAME al Web Service en Render.
- **Datos de salud:** al tratarse de fichas clínicas, se debe restringir el acceso a `FichaClinica` y `Tratamiento` solo al staff de la clínica y al propio paciente (via `UsuarioPaciente`), con permisos separados de los datos administrativos (agenda, pagos).
- **Backups:** respaldo automático de la base de datos (Render lo ofrece en los planes pagados), dado que se almacena información clínica sensible.
