from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Cita, FichaClinica, HorarioProfesional, Pago, Paciente, Profesional, Tratamiento
from .validators import normalizar_telefono_cl


class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = ["id", "nombre", "rut", "telefono", "fecha_nacimiento"]


class FichaClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichaClinica
        fields = ["id", "paciente", "historial", "odontograma", "notas_clinicas", "actualizado"]


class ProfesionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profesional
        fields = ["id", "nombre", "especialidad", "box_asignado"]


class HorarioProfesionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioProfesional
        fields = ["id", "profesional", "dia_semana", "hora_inicio", "hora_fin"]


def _validar_sin_choque(profesional, fecha, hora, excluir_pk=None):
    """
    Compartido entre CitaSerializer (staff) y ReservaPublicaSerializer
    (pública): ningún profesional puede tener dos citas no canceladas a la
    misma fecha+hora. Antes de agregar esto ninguno de los dos caminos lo
    validaba.
    """
    choque = Cita.objects.filter(profesional=profesional, fecha=fecha, hora=hora).exclude(
        estado="cancelada"
    )
    if excluir_pk:
        choque = choque.exclude(pk=excluir_pk)
    if choque.exists():
        raise serializers.ValidationError("Ese profesional ya tiene una cita a esa hora.")


class CitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source="paciente.nombre", read_only=True)
    profesional_nombre = serializers.CharField(source="profesional.nombre", read_only=True)

    class Meta:
        model = Cita
        fields = [
            "id", "paciente", "paciente_nombre", "profesional", "profesional_nombre",
            "fecha", "hora", "estado", "box", "motivo",
            "recordatorio_estado", "recordatorio_enviado_at", "whatsapp_message_id",
        ]
        read_only_fields = ["recordatorio_estado", "recordatorio_enviado_at", "whatsapp_message_id"]

    def validate(self, data):
        profesional = data.get("profesional", getattr(self.instance, "profesional", None))
        fecha = data.get("fecha", getattr(self.instance, "fecha", None))
        hora = data.get("hora", getattr(self.instance, "hora", None))
        if profesional and fecha and hora:
            _validar_sin_choque(
                profesional, fecha, hora, excluir_pk=self.instance.pk if self.instance else None
            )
        return data


class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = ["id", "ficha_clinica", "cita", "tipo", "costo", "estado"]


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = ["id", "paciente", "tratamiento", "monto", "fecha", "medio_pago", "estado"]


class ReservaPublicaSerializer(serializers.Serializer):
    """
    Reserva pública sin login: encuentra o crea el Paciente por RUT y crea
    la Cita en estado "pendiente" (el staff la confirma después desde la
    Agenda, mismo criterio que PataAgenda para su reserva pública).
    """

    nombre = serializers.CharField(max_length=150)
    rut = serializers.CharField(max_length=12)
    telefono = serializers.CharField(max_length=20)
    profesional = serializers.PrimaryKeyRelatedField(queryset=Profesional.objects.all())
    fecha = serializers.DateField()
    hora = serializers.TimeField()
    motivo = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_telefono(self, valor):
        return normalizar_telefono_cl(valor)

    def validate(self, data):
        profesional = data["profesional"]
        fecha = data["fecha"]
        hora = data["hora"]

        horario = HorarioProfesional.objects.filter(
            profesional=profesional, dia_semana=fecha.weekday()
        ).first()
        if not horario or not (horario.hora_inicio <= hora < horario.hora_fin):
            raise serializers.ValidationError("Ese horario no está disponible para este profesional.")

        _validar_sin_choque(profesional, fecha, hora)
        return data

    def create(self, validated_data):
        paciente, _ = Paciente.objects.get_or_create(
            rut=validated_data["rut"],
            defaults={
                "nombre": validated_data["nombre"],
                "telefono": validated_data["telefono"],
            },
        )
        return Cita.objects.create(
            paciente=paciente,
            profesional=validated_data["profesional"],
            fecha=validated_data["fecha"],
            hora=validated_data["hora"],
            motivo=validated_data.get("motivo", ""),
            estado="pendiente",
        )


class CambiarPasswordSerializer(serializers.Serializer):
    """Cambio de clave propia, para cualquier usuario logueado (staff o paciente)."""

    password_actual = serializers.CharField(write_only=True)
    password_nueva = serializers.CharField(write_only=True)

    def validate_password_actual(self, valor):
        usuario = self.context["request"].user
        if not usuario.check_password(valor):
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return valor

    def validate_password_nueva(self, valor):
        validate_password(valor, user=self.context["request"].user)
        return valor

    def save(self):
        usuario = self.context["request"].user
        usuario.set_password(self.validated_data["password_nueva"])
        usuario.save(update_fields=["password"])
