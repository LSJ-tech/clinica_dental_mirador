from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import FichaClinica, Paciente


@receiver(post_save, sender=Paciente)
def crear_ficha_clinica(sender, instance, created, **kwargs):
    """
    Todo Paciente tiene su FichaClinica desde que se crea, para que el resto
    del sistema (frontend incluido) nunca tenga que manejar el caso "paciente
    sin ficha todavía".
    """
    if created:
        FichaClinica.objects.get_or_create(paciente=instance)
