import logging

from django.conf import settings
from django.core.mail import send_mail

from .tokens import generar_token_confirmacion

logger = logging.getLogger(__name__)

_DIRECCION_CLINICA = "El Mirador #459 (Sitio 17-E), Casablanca"


def _enviar(destinatario, asunto, cuerpo):
    # Nunca debe romper el flujo que la llama (reservar hora, comando de
    # recordatorios): un correo que falla se loguea, no revienta la reserva.
    try:
        send_mail(asunto, cuerpo, settings.DEFAULT_FROM_EMAIL, [destinatario], fail_silently=False)
        return True
    except Exception:
        logger.exception("No se pudo enviar el correo '%s' a %s", asunto, destinatario)
        return False


def enviar_confirmacion_reserva(cita):
    paciente = cita.paciente
    if not paciente.email:
        return False
    cuerpo = (
        f"Hola {paciente.nombre},\n\n"
        f"Tu hora en Clínica Dental El Mirador quedó registrada:\n\n"
        f"Fecha: {cita.fecha.strftime('%d-%m-%Y')}\n"
        f"Hora: {cita.hora.strftime('%H:%M')}\n"
        f"Profesional: {cita.profesional.nombre}\n\n"
        f"Tu hora queda pendiente de confirmación por nuestro equipo. Antes de la fecha te "
        f"enviaremos un recordatorio para reconfirmarla.\n\n"
        f"{_DIRECCION_CLINICA}\n"
        f"Si necesitas reagendar o cancelar, contáctanos al +569 5604 3960.\n\n"
        f"Clínica Dental El Mirador"
    )
    return _enviar(paciente.email, "Tu hora quedó reservada - Clínica Dental El Mirador", cuerpo)


def enviar_recordatorio_cita(cita):
    paciente = cita.paciente
    if not paciente.email:
        return False
    token = generar_token_confirmacion(cita.id)
    link_confirmar = f"{settings.FRONTEND_URL}/confirmar-cita/{token}"
    cuerpo = (
        f"Hola {paciente.nombre},\n\n"
        f"Te recordamos tu hora en Clínica Dental El Mirador:\n\n"
        f"Fecha: {cita.fecha.strftime('%d-%m-%Y')}\n"
        f"Hora: {cita.hora.strftime('%H:%M')}\n"
        f"Profesional: {cita.profesional.nombre}\n\n"
        f"Por favor confirma tu asistencia entrando a este link:\n{link_confirmar}\n\n"
        f"Si no puedes asistir, avísanos al +569 5604 3960 para dar tu hora a otro paciente.\n\n"
        f"{_DIRECCION_CLINICA}\n\n"
        f"Clínica Dental El Mirador"
    )
    return _enviar(paciente.email, "Confirma tu hora - Clínica Dental El Mirador", cuerpo)
