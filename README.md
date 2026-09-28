# Clínica Dental El Mirador

Proyecto DevQuad para Clínica Dental El Mirador (Casablanca): sistema de gestión clínica a medida (fichas de pacientes, agenda por dentista/box, perfil de acceso para pacientes, recordatorios automáticos por WhatsApp Business, pagos y reportes).

Es un desarrollo nuevo, no una extensión de [PataAgenda](https://patagenda.devquad.cl) — reutiliza solo el patrón de infraestructura en Render, no el código (PataAgenda es un monolito Django con templates y WhatsApp manual vía `wa.me`; este proyecto usa Django + DRF en el backend y React en el frontend, con integración real a la WhatsApp Cloud API).

## Contenido

- [`informes/propuesta_comercial.md`](informes/propuesta_comercial.md) — propuesta enviada al cliente: prestaciones, costos, plazos e impacto
- [`informes/informe_tecnico.md`](informes/informe_tecnico.md) — informe interno para el equipo: arquitectura, modelo de datos e integración WhatsApp

## Estado

Etapa de propuesta / levantamiento. Código del sistema aún no iniciado.

## Contacto

DevQuad — devquad.cl
