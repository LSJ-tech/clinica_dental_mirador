import datetime
import secrets
import string

from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cita, FichaClinica, HorarioProfesional, Pago, Paciente, Profesional, Tratamiento
from .permissions import EsPacientePropioOStaff, EsSuperusuario, SoloStaffEscribe
from .serializers import (
    CambiarPasswordSerializer,
    CitaSerializer,
    FichaClinicaSerializer,
    HorarioProfesionalSerializer,
    PacienteSerializer,
    PagoSerializer,
    ProfesionalSerializer,
    ReservaPublicaSerializer,
    TratamientoSerializer,
)

DURACION_SLOT_MINUTOS = 30

# Sin 0/O/1/l/I: el staff lee esta clave en voz alta por teléfono al
# paciente, y esos caracteres se confunden fácil al dictarlos.
_ALFABETO_PASSWORD_TEMPORAL = "".join(
    c for c in string.ascii_letters + string.digits if c not in "0O1lI"
)


def _generar_password_temporal():
    return "".join(secrets.choice(_ALFABETO_PASSWORD_TEMPORAL) for _ in range(10))


class PacienteViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe, EsPacientePropioOStaff]

    def get_permissions(self):
        # Eliminar un paciente borra en cascada su ficha, citas y pagos --
        # a diferencia de crear/editar, queda reservado al superusuario.
        if self.action == "destroy":
            return [permissions.IsAuthenticated(), EsSuperusuario()]
        return super().get_permissions()

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = Paciente.objects.all()
        else:
            qs = Paciente.objects.filter(user=self.request.user)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(rut__icontains=q) | Q(telefono__icontains=q))
        return qs

    @action(detail=True, methods=["post"])
    def resetear_password(self, request, pk=None):
        # Reset manual mientras no exista un canal propio (email/WhatsApp)
        # para que el paciente lo haga solo: cualquier staff genera una
        # clave temporal y se la comunica por teléfono tras verificar
        # identidad. No requiere superusuario porque no es destructivo,
        # a diferencia de eliminar un paciente.
        paciente = self.get_object()
        if paciente.user_id is None:
            return Response({"detail": "Este paciente no tiene una cuenta creada."}, status=400)
        password_temporal = _generar_password_temporal()
        paciente.user.set_password(password_temporal)
        paciente.user.save(update_fields=["password"])
        return Response({"password_temporal": password_temporal})


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
    # Sin IsAuthenticated a propósito: cualquiera necesita poder ver la
    # lista de profesionales para elegir uno al reservar hora en la web
    # pública. SoloStaffEscribe ya deja las escrituras solo para staff.
    permission_classes = [SoloStaffEscribe]
    queryset = Profesional.objects.all()


class HorarioProfesionalViewSet(viewsets.ModelViewSet):
    serializer_class = HorarioProfesionalSerializer
    permission_classes = [permissions.IsAuthenticated, SoloStaffEscribe]

    def get_queryset(self):
        qs = HorarioProfesional.objects.all()
        profesional_id = self.request.query_params.get("profesional")
        if profesional_id:
            qs = qs.filter(profesional_id=profesional_id)
        return qs


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
            "is_superuser": request.user.is_superuser,
            "paciente": PacienteSerializer(paciente).data if paciente else None,
        })


class DisponibilidadView(APIView):
    """
    Horas libres de un profesional en una fecha dada, para la reserva
    pública. Pública a propósito (AllowAny): solo expone horas ocupadas o
    no, nunca de quién son.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        profesional_id = request.query_params.get("profesional")
        fecha_str = request.query_params.get("fecha")
        if not profesional_id or not fecha_str:
            return Response({"detail": "Faltan los parámetros profesional y fecha."}, status=400)
        try:
            fecha = datetime.date.fromisoformat(fecha_str)
        except ValueError:
            return Response({"detail": "Fecha inválida."}, status=400)

        horario = HorarioProfesional.objects.filter(
            profesional_id=profesional_id, dia_semana=fecha.weekday()
        ).first()
        if not horario:
            return Response({"slots": []})

        ocupadas = set(
            Cita.objects.filter(profesional_id=profesional_id, fecha=fecha)
            .exclude(estado="cancelada")
            .values_list("hora", flat=True)
        )

        ahora = timezone.localtime()
        paso = datetime.timedelta(minutes=DURACION_SLOT_MINUTOS)
        cursor = datetime.datetime.combine(fecha, horario.hora_inicio)
        fin = datetime.datetime.combine(fecha, horario.hora_fin)

        slots = []
        while cursor < fin:
            hora_slot = cursor.time()
            ya_paso = fecha == ahora.date() and hora_slot <= ahora.time()
            if hora_slot not in ocupadas and not ya_paso:
                slots.append(hora_slot.strftime("%H:%M"))
            cursor += paso

        return Response({"slots": slots})


class ReservaPublicaView(APIView):
    """Crea una Cita desde la web pública, sin login."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ReservaPublicaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita = serializer.save()
        return Response(
            {
                "id": cita.id,
                "fecha": cita.fecha,
                "hora": cita.hora,
                "estado": cita.estado,
                "cuenta_creada": serializer.cuenta_creada,
            },
            status=201,
        )


class CambiarPasswordView(APIView):
    """Permite a cualquier usuario logueado (staff o paciente) cambiar su propia clave."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Contraseña actualizada."})
