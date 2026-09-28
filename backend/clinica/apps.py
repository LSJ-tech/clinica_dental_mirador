from django.apps import AppConfig


class ClinicaConfig(AppConfig):
    name = 'clinica'

    def ready(self):
        from . import signals  # noqa: F401
