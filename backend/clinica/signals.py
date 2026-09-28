from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import FichaClinica, HorarioProfesional, Paciente, Profesional


@receiver(post_save, sender=Paciente)
def crear_ficha_clinica(sender, instance, created, **kwargs):
    """
    Todo Paciente tiene su FichaClinica desde que se crea, para que el resto
    del sistema (frontend incluido) nunca tenga que manejar el caso "paciente
    sin ficha todavía".
    """
    if created:
        FichaClinica.objects.get_or_create(paciente=instance)


@receiver(post_save, sender=Profesional)
def crear_horario_por_defecto(sender, instance, created, **kwargs):
    """
    Todo Profesional nuevo parte atendiendo Lunes a Sábado 09:00-18:00, para
    que la reserva pública funcione de inmediato sin que el staff tenga que
    configurar nada primero. El staff ajusta/borra días después si no
    corresponden (domingo parte cerrado, sin fila).
    """
    if created:
        HorarioProfesional.objects.bulk_create([
            HorarioProfesional(
                profesional=instance, dia_semana=dia, hora_inicio="09:00", hora_fin="18:00"
            )
            for dia in range(6)
        ])
