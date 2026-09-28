from rest_framework import serializers

from .models import Cita, FichaClinica, Pago, Paciente, Profesional, Tratamiento


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


class CitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source="paciente.nombre", read_only=True)
    profesional_nombre = serializers.CharField(source="profesional.nombre", read_only=True)

    class Meta:
        model = Cita
        fields = [
            "id", "paciente", "paciente_nombre", "profesional", "profesional_nombre",
            "fecha", "hora", "estado", "box",
            "recordatorio_estado", "recordatorio_enviado_at", "whatsapp_message_id",
        ]
        read_only_fields = ["recordatorio_estado", "recordatorio_enviado_at", "whatsapp_message_id"]


class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = ["id", "ficha_clinica", "cita", "tipo", "costo", "estado"]


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = ["id", "paciente", "tratamiento", "monto", "fecha", "medio_pago", "estado"]
