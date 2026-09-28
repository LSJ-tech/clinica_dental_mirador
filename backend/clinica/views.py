from rest_framework import generics, permissions, viewsets

from .models import Cita, FichaClinica, Pago, Paciente, Profesional, Tratamiento
from .permissions import EsPacientePropioOStaff, SoloStaffEscribe
from .serializers import (
    CitaSerializer,
    FichaClinicaSerializer,
    PacienteSerializer,
    PagoSerializer,
    ProfesionalSerializer,
    TratamientoSerializer,
)


class PacienteViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Paciente.objects.all()
        return Paciente.objects.filter(user=self.request.user)


class FichaClinicaViewSet(viewsets.ModelViewSet):
    serializer_class = FichaClinicaSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            return FichaClinica.objects.all()
        return FichaClinica.objects.filter(paciente__user=self.request.user)


class ProfesionalViewSet(viewsets.ModelViewSet):
    serializer_class = ProfesionalSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe]
    queryset = Profesional.objects.all()


class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Cita.objects.all()
        return Cita.objects.filter(paciente__user=self.request.user)


class TratamientoViewSet(viewsets.ModelViewSet):
    serializer_class = TratamientoSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Tratamiento.objects.all()
        return Tratamiento.objects.filter(ficha_clinica__paciente__user=self.request.user)


class PagoViewSet(viewsets.ModelViewSet):
    serializer_class = PagoSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Pago.objects.all()
        return Pago.objects.filter(paciente__user=self.request.user)


class MeView(generics.RetrieveAPIView):
    """Bootstrap para el SPA: el Paciente asociado al usuario logueado."""

    serializer_class = PacienteSerializer

    def get_object(self):
        return self.request.user.paciente
