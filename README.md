# Clínica Dental El Mirador

Proyecto DevQuad para Clínica Dental El Mirador (Casablanca): sistema de gestión clínica a medida (fichas de pacientes, agenda por dentista/box, perfil de acceso para pacientes, recordatorios automáticos por WhatsApp Business, pagos y reportes).

Es un desarrollo nuevo, no una extensión de [PataAgenda](https://patagenda.devquad.cl) — reutiliza solo el patrón de infraestructura en Render, no el código (PataAgenda es un monolito Django con templates y WhatsApp manual vía `wa.me`; este proyecto usa Django + DRF en el backend y React en el frontend, con integración real a la WhatsApp Cloud API).

## Contenido

- [`informes/propuesta_comercial.md`](informes/propuesta_comercial.md) — propuesta enviada al cliente: prestaciones, costos, plazos e impacto
- [`informes/informe_tecnico.md`](informes/informe_tecnico.md) — informe interno para el equipo: arquitectura, modelo de datos e integración WhatsApp

## Estado

Desplegado en Render (backend + frontend + DB), completo salvo WhatsApp:

- **Landing pública** (`/`): marketing, servicios, equipo real (`/equipo`) y ubicación con mapa.
- **Reserva de hora pública, sin login** (`/reservar`): elige profesional y fecha, ve las horas realmente disponibles (respeta el horario semanal de cada profesional y evita choques), y agenda con nombre/RUT/teléfono — la cita queda "pendiente" hasta que el staff la confirme.
- **Portal del paciente**: mis citas, mi ficha clínica (historial, notas, tratamientos) y mis pagos — todo de solo lectura para el paciente.
- **Panel de staff**: pacientes (buscar/crear/editar, con pestañas de ficha/tratamientos/pagos/citas), agenda por día (crear citas, confirmar/completar/cancelar), y profesionales (CRUD + horario semanal editable por día).
- Login único (`/login`) que redirige a `/citas` o `/staff` según el rol.

Sin integración real de WhatsApp Cloud API todavía, y sin editor de odontograma (el campo existe en el modelo pero no tiene UI propia). La creación de la cuenta de acceso de un paciente (`Paciente.user`) sigue siendo manual por Django admin/shell.

## Cómo correr en local

**Backend** (`backend/`):
```
cd backend
./venv/Scripts/python.exe manage.py migrate
./venv/Scripts/python.exe manage.py createsuperuser
./venv/Scripts/python.exe manage.py runserver
```
Sirve la API en `http://localhost:8000/api/` y el admin en `http://localhost:8000/admin/`.

**Frontend** (`frontend/`):
```
cd frontend
npm install
npm run dev
```
Sirve la SPA en `http://localhost:5173`. Necesita `.env` con `VITE_API_URL=http://localhost:8000/api` (ver `.env.example`).

Para probar el login hace falta un `Paciente` con `user` asociado (username = teléfono normalizado `+56XXXXXXXXX`) y contraseña puesta a mano desde el shell o el admin.

## Contacto

DevQuad — devquad.cl
