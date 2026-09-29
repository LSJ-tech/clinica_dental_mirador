import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from clinica.emails import enviar_recordatorio_cita
from clinica.models import Cita

# Estados que ya no necesitan recordatorio: la cita no va a pasar (o ya pasó).
ESTADOS_SIN_RECORDATORIO = ("cancelada", "completada", "no_asistio")


class Command(BaseCommand):
    help = (
        "Manda el correo de recordatorio/reconfirmación a los pacientes con cita mañana "
        "(pensado para correr una vez al día vía un cron, ver render.yaml)."
    )

    def handle(self, *args, **options):
        manana = timezone.localdate() + datetime.timedelta(days=1)
        citas = (
            Cita.objects.select_related("paciente", "profesional")
            .filter(fecha=manana, recordatorio_estado="no_enviado")
            .exclude(estado__in=ESTADOS_SIN_RECORDATORIO)
            .exclude(paciente__email="")
        )

        enviados = 0
        fallidos = 0
        for cita in citas:
            if enviar_recordatorio_cita(cita):
                cita.recordatorio_estado = "enviado"
                cita.recordatorio_enviado_at = timezone.now()
                cita.save(update_fields=["recordatorio_estado", "recordatorio_enviado_at"])
                enviados += 1
            else:
                cita.recordatorio_estado = "fallido"
                cita.save(update_fields=["recordatorio_estado"])
                fallidos += 1

        self.stdout.write(
            self.style.SUCCESS(f"Recordatorios para el {manana}: {enviados} enviados, {fallidos} fallidos.")
        )
