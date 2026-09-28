from django.conf import settings
from django.db import models

from .validators import telefono_validator


class Paciente(models.Model):
    nombre = models.CharField(max_length=150)
    rut = models.CharField(max_length=12, unique=True)
    telefono = models.CharField(max_length=20, validators=[telefono_validator])
    fecha_nacimiento = models.DateField(null=True, blank=True)
    # Cuenta de acceso al portal del paciente. Puede ser null: un paciente
    # puede existir en el sistema (agendado por el staff) sin tener todavía
    # una cuenta propia para entrar a ver su ficha.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="paciente",
    )

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class FichaClinica(models.Model):
    # Separada de Paciente a propósito: permite aplicar permisos más
    # estrictos sobre datos de salud que sobre los datos de cuenta.
    paciente = models.OneToOneField(
        Paciente, on_delete=models.CASCADE, related_name="ficha_clinica"
    )
    historial = models.TextField(blank=True)
    odontograma = models.JSONField(default=dict, blank=True)
    notas_clinicas = models.TextField(blank=True)
    actualizado = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ficha de {self.paciente.nombre}"


class Profesional(models.Model):
    nombre = models.CharField(max_length=150)
    especialidad = models.CharField(max_length=150)
    box_asignado = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Cita(models.Model):
    ESTADO_CHOICES = [
        ("pendiente", "Pendiente"),
        ("confirmada", "Confirmada"),
        ("completada", "Completada"),
        ("cancelada", "Cancelada"),
        ("no_asistio", "No asistió"),
    ]
    RECORDATORIO_ESTADO_CHOICES = [
        ("no_enviado", "No enviado"),
        ("enviado", "Enviado"),
        ("entregado", "Entregado"),
        ("leido", "Leído"),
        ("fallido", "Fallido"),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="citas")
    profesional = models.ForeignKey(Profesional, on_delete=models.PROTECT, related_name="citas")
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="pendiente")
    box = models.CharField(max_length=20, blank=True)

    # Campos para la integración con WhatsApp Cloud API (milestone futuro):
    # dejan lista la trazabilidad de cada recordatorio sin necesitar una
    # migración nueva cuando se implemente el envío real.
    recordatorio_estado = models.CharField(
        max_length=20, choices=RECORDATORIO_ESTADO_CHOICES, default="no_enviado"
    )
    recordatorio_enviado_at = models.DateTimeField(null=True, blank=True)
    whatsapp_message_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["fecha", "hora"]

    def __str__(self):
        return f"{self.paciente.nombre} · {self.fecha} {self.hora}"


class Tratamiento(models.Model):
    ESTADO_CHOICES = [
        ("presupuestado", "Presupuestado"),
        ("en_curso", "En curso"),
        ("completado", "Completado"),
        ("cancelado", "Cancelado"),
    ]

    ficha_clinica = models.ForeignKey(
        FichaClinica, on_delete=models.CASCADE, related_name="tratamientos"
    )
    cita = models.ForeignKey(
        Cita, on_delete=models.SET_NULL, null=True, blank=True, related_name="tratamientos"
    )
    tipo = models.CharField(max_length=150)
    costo = models.DecimalField(max_digits=10, decimal_places=0)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="presupuestado")

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.tipo} · {self.ficha_clinica.paciente.nombre}"


class Pago(models.Model):
    MEDIO_PAGO_CHOICES = [
        ("efectivo", "Efectivo"),
        ("tarjeta", "Tarjeta"),
        ("transferencia", "Transferencia"),
        ("otro", "Otro"),
    ]
    ESTADO_CHOICES = [
        ("pendiente", "Pendiente"),
        ("pagado", "Pagado"),
        ("anulado", "Anulado"),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="pagos")
    tratamiento = models.ForeignKey(
        Tratamiento, on_delete=models.SET_NULL, null=True, blank=True, related_name="pagos"
    )
    monto = models.DecimalField(max_digits=10, decimal_places=0)
    fecha = models.DateField()
    medio_pago = models.CharField(max_length=20, choices=MEDIO_PAGO_CHOICES, default="efectivo")
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="pendiente")

    class Meta:
        ordering = ["-fecha"]

    def __str__(self):
        return f"${self.monto} · {self.paciente.nombre}"
