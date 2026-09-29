import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .tokens import generar_token_confirmacion

logger = logging.getLogger(__name__)

_DIRECCION_CLINICA = "El Mirador #459 (Sitio 17-E), Casablanca"


def _enviar(destinatario, asunto, cuerpo_texto, template_html, contexto):
    # Nunca debe romper el flujo que la llama (reservar hora, comando de
    # recordatorios): un correo que falla se loguea, no revienta la reserva.
    # Se manda multipart (texto + HTML) en vez de solo HTML: clientes de
    # correo que no rendericen HTML (o filtros anti-spam) igual muestran
    # algo legible.
    try:
        html = render_to_string(template_html, contexto)
        mensaje = EmailMultiAlternatives(asunto, cuerpo_texto, settings.DEFAULT_FROM_EMAIL, [destinatario])
        mensaje.attach_alternative(html, "text/html")
        mensaje.send(fail_silently=False)
        return True
    except Exception:
        logger.exception("No se pudo enviar el correo '%s' a %s", asunto, destinatario)
        return False


def enviar_confirmacion_reserva(cita):
    paciente = cita.paciente
    if not paciente.email:
        return False
    fecha = cita.fecha.strftime("%d-%m-%Y")
    hora = cita.hora.strftime("%H:%M")
    cuerpo_texto = (
        f"Hola {paciente.nombre},\n\n"
        f"Tu hora en Clínica Dental El Mirador quedó confirmada:\n\n"
        f"Fecha: {fecha}\n"
        f"Hora: {hora}\n"
        f"Profesional: {cita.profesional.nombre}\n\n"
        f"Antes de la fecha te enviaremos un recordatorio para que la reconfirmes.\n\n"
        f"{_DIRECCION_CLINICA}\n"
        f"Si necesitas reagendar o cancelar, contáctanos al +569 5604 3960.\n\n"
        f"Clínica Dental El Mirador"
    )
    return _enviar(
        paciente.email,
        "Tu hora quedó confirmada - Clínica Dental El Mirador",
        cuerpo_texto,
        "clinica/emails/confirmacion_reserva.html",
        {
            "paciente_nombre": paciente.nombre,
            "fecha": fecha,
            "hora": hora,
            "profesional": cita.profesional.nombre,
        },
    )


def enviar_notificacion_nueva_reserva_a_clinica(cita):
    paciente = cita.paciente
    fecha = cita.fecha.strftime("%d-%m-%Y")
    hora = cita.hora.strftime("%H:%M")
    cuerpo_texto = (
        f"Nueva reserva desde la web pública:\n\n"
        f"Paciente: {paciente.nombre}\n"
        f"RUT: {paciente.rut}\n"
        f"Teléfono: {paciente.telefono}\n"
        f"Email: {paciente.email or '(no dejó email)'}\n\n"
        f"Fecha: {fecha}\n"
        f"Hora: {hora}\n"
        f"Profesional: {cita.profesional.nombre}\n"
        f"Motivo: {cita.motivo}\n"
    )
    return _enviar(
        settings.CLINICA_EMAIL_NOTIFICACIONES,
        f"Nueva reserva: {paciente.nombre} - {fecha} {hora}",
        cuerpo_texto,
        "clinica/emails/notificacion_clinica.html",
        {
            "paciente_nombre": paciente.nombre,
            "paciente_rut": paciente.rut,
            "paciente_telefono": paciente.telefono,
            "paciente_email": paciente.email or "(no dejó email)",
            "fecha": fecha,
            "hora": hora,
            "profesional": cita.profesional.nombre,
            "motivo": cita.motivo or "-",
        },
    )


def enviar_recordatorio_cita(cita):
    paciente = cita.paciente
    if not paciente.email:
        return False
    token = generar_token_confirmacion(cita.id)
    link_confirmar = f"{settings.FRONTEND_URL}/confirmar-cita/{token}"
    fecha = cita.fecha.strftime("%d-%m-%Y")
    hora = cita.hora.strftime("%H:%M")
    cuerpo_texto = (
        f"Hola {paciente.nombre},\n\n"
        f"Te recordamos tu hora en Clínica Dental El Mirador:\n\n"
        f"Fecha: {fecha}\n"
        f"Hora: {hora}\n"
        f"Profesional: {cita.profesional.nombre}\n\n"
        f"Por favor confirma tu asistencia entrando a este link:\n{link_confirmar}\n\n"
        f"Si no puedes asistir, avísanos al +569 5604 3960 para dar tu hora a otro paciente.\n\n"
        f"{_DIRECCION_CLINICA}\n\n"
        f"Clínica Dental El Mirador"
    )
    return _enviar(
        paciente.email,
        "Confirma tu hora - Clínica Dental El Mirador",
        cuerpo_texto,
        "clinica/emails/recordatorio_cita.html",
        {
            "paciente_nombre": paciente.nombre,
            "fecha": fecha,
            "hora": hora,
            "profesional": cita.profesional.nombre,
            "link_confirmar": link_confirmar,
        },
    )
