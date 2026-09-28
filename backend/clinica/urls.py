from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("pacientes", views.PacienteViewSet, basename="paciente")
router.register("fichas-clinicas", views.FichaClinicaViewSet, basename="fichaclinica")
router.register("profesionales", views.ProfesionalViewSet, basename="profesional")
router.register("citas", views.CitaViewSet, basename="cita")
router.register("tratamientos", views.TratamientoViewSet, basename="tratamiento")
router.register("pagos", views.PagoViewSet, basename="pago")

urlpatterns = [
    path("me/", views.MeView.as_view(), name="me"),
    path("", include(router.urls)),
]
