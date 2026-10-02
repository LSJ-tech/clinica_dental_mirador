from django.core.management.base import BaseCommand

from clinica.emails import enviar_recordatorios_pendientes


class Command(BaseCommand):
    help = (
        "Manda el correo de recordatorio/reconfirmación a los pacientes con cita mañana "
        "(pensado para correr una vez al día vía un cron, ver render.yaml; también se puede "
        "disparar a mano desde el panel de staff, ver EnviarRecordatoriosView)."
    )

    def handle(self, *args, **options):
        manana, enviados, fallidos = enviar_recordatorios_pendientes()
        self.stdout.write(
            self.style.SUCCESS(f"Recordatorios para el {manana}: {enviados} enviados, {fallidos} fallidos.")
        )
