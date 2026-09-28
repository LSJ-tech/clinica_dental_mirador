from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

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
            qs = Paciente.objects.all()
        else:
            qs = Paciente.objects.filter(user=self.request.user)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(rut__icontains=q) | Q(telefono__icontains=q))
        return qs


class FichaClinicaViewSet(viewsets.ModelViewSet):
    serializer_class = FichaClinicaSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = FichaClinica.objects.all()
        else:
            qs = FichaClinica.objects.filter(paciente__user=self.request.user)
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs


class ProfesionalViewSet(viewsets.ModelViewSet):
    serializer_class = ProfesionalSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe]
    queryset = Profesional.objects.all()


class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = Cita.objects.all()
        else:
            qs = Cita.objects.filter(paciente__user=self.request.user)
        fecha = self.request.query_params.get("fecha")
        if fecha:
            qs = qs.filter(fecha=fecha)
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs


class TratamientoViewSet(viewsets.ModelViewSet):
    serializer_class = TratamientoSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = Tratamiento.objects.all()
        else:
            qs = Tratamiento.objects.filter(ficha_clinica__paciente__user=self.request.user)
        ficha_clinica_id = self.request.query_params.get("ficha_clinica")
        if ficha_clinica_id:
            qs = qs.filter(ficha_clinica_id=ficha_clinica_id)
        return qs


class PagoViewSet(viewsets.ModelViewSet):
    serializer_class = PagoSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = Pago.objects.all()
        else:
            qs = Pago.objects.filter(paciente__user=self.request.user)
        paciente_id = self.request.query_params.get("paciente")
        if paciente_id:
            qs = qs.filter(paciente_id=paciente_id)
        return qs


class MeView(APIView):
    """
    Bootstrap para el SPA: le dice al frontend si el usuario logueado es
    staff o paciente (y sus datos de Paciente si corresponde), porque el JWT
    en sí no trae esa distinción.
    """

    def get(self, request):
        paciente = getattr(request.user, "paciente", None)
        return Response({
            "is_staff": request.user.is_staff,
            "paciente": PacienteSerializer(paciente).data if paciente else None,
        })
