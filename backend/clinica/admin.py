from django.contrib import admin

from .models import Cita, FichaClinica, Pago, Paciente, Profesional, Tratamiento


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ["nombre", "rut", "telefono", "user"]
    search_fields = ["nombre", "rut", "telefono"]


@admin.register(FichaClinica)
class FichaClinicaAdmin(admin.ModelAdmin):
    list_display = ["paciente", "actualizado"]
    search_fields = ["paciente__nombre"]


@admin.register(Profesional)
class ProfesionalAdmin(admin.ModelAdmin):
    list_display = ["nombre", "especialidad", "box_asignado"]
    search_fields = ["nombre", "especialidad"]


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ["paciente", "profesional", "fecha", "hora", "estado", "recordatorio_estado"]
    list_filter = ["estado", "fecha", "recordatorio_estado"]
    search_fields = ["paciente__nombre", "profesional__nombre"]


@admin.register(Tratamiento)
class TratamientoAdmin(admin.ModelAdmin):
    list_display = ["tipo", "ficha_clinica", "costo", "estado"]
    list_filter = ["estado"]
    search_fields = ["tipo", "ficha_clinica__paciente__nombre"]


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ["paciente", "monto", "fecha", "medio_pago", "estado"]
    list_filter = ["medio_pago", "estado"]
    search_fields = ["paciente__nombre"]
