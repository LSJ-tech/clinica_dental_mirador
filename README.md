# Clínica Dental El Mirador

Proyecto DevQuad para Clínica Dental El Mirador (Casablanca): sistema de gestión clínica a medida (fichas de pacientes, agenda por dentista/box, perfil de acceso para pacientes, recordatorios automáticos por WhatsApp Business, pagos y reportes).

Es un desarrollo nuevo, no una extensión de [PataAgenda](https://patagenda.devquad.cl) — reutiliza solo el patrón de infraestructura en Render, no el código (PataAgenda es un monolito Django con templates y WhatsApp manual vía `wa.me`; este proyecto usa Django + DRF en el backend y React en el frontend, con integración real a la WhatsApp Cloud API).

## Contenido

- [`informes/propuesta_comercial.md`](informes/propuesta_comercial.md) — propuesta enviada al cliente: prestaciones, costos, plazos e impacto
- [`informes/informe_tecnico.md`](informes/informe_tecnico.md) — informe interno para el equipo: arquitectura, modelo de datos e integración WhatsApp

## Estado

Scaffold inicial funcionando en local: backend (Django + DRF, modelos, JWT, permisos por paciente/staff) y frontend (React + Vite, login + listado de citas) ya conectados entre sí. Todavía sin desplegar, sin integración real de WhatsApp Cloud API y sin la UI completa (agenda, ficha clínica, pagos).

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
