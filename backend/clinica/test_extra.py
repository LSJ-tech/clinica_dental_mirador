from datetime import date, time as dt_time

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from .models import Cita, FichaClinica, HorarioProfesional, Pago, Paciente, Profesional, Tratamiento
from .permissions import EsPacientePropioOStaff
from .tests import proximo_lunes
from .validators import normalizar_rut


class _RequestFalso:
    """Standin minimo: has_object_permission solo lee request.user."""

    def __init__(self, user):
        self.user = user


@pytest.mark.django_db
class TestEsPacientePropioOStaff:
    def test_staff_tiene_permiso_sobre_cualquier_objeto(self):
        staff = User.objects.create_user(username="staffx", password="x", is_staff=True)
        permiso = EsPacientePropioOStaff()
        assert permiso.has_object_permission(_RequestFalso(staff), None, object()) is True

    def test_paciente_sin_perfil_no_tiene_permiso(self):
        user = User.objects.create_user(username="sinperfil", password="x")
        permiso = EsPacientePropioOStaff()
        assert permiso.has_object_permission(_RequestFalso(user), None, object()) is False

    def test_paciente_ve_su_propio_registro(self):
        user = User.objects.create_user(username="conperfil", password="x")
        paciente = Paciente.objects.create(nombre="Ana", rut="9-1", telefono="+56911111111", user=user)
        permiso = EsPacientePropioOStaff()
        assert permiso.has_object_permission(_RequestFalso(user), None, paciente) is True

    def test_paciente_no_ve_registro_de_otro_paciente(self):
        user = User.objects.create_user(username="conperfil2", password="x")
        Paciente.objects.create(nombre="Ana", rut="9-1", telefono="+56911111111", user=user)
        otro = Paciente.objects.create(nombre="Luis", rut="8-2", telefono="+56922222222")
        permiso = EsPacientePropioOStaff()
        assert permiso.has_object_permission(_RequestFalso(user), None, otro) is False

    def test_paciente_ve_objeto_relacionado_a_su_propia_ficha(self):
        user = User.objects.create_user(username="conperfil3", password="x")
        paciente = Paciente.objects.create(nombre="Ana", rut="9-1", telefono="+56911111111", user=user)
        profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        cita = Cita.objects.create(
            paciente=paciente, profesional=profesional, fecha=date.today(), hora="10:00"
        )
        permiso = EsPacientePropioOStaff()
        assert permiso.has_object_permission(_RequestFalso(user), None, cita) is True


@pytest.mark.django_db
class TestQuerysetsPorPerfil:
    def setup_method(self):
        self.client = APIClient()

    def test_paciente_ve_solo_su_propio_registro_en_pacientes(self):
        user1 = User.objects.create_user(username="+56911111111", password="x")
        user2 = User.objects.create_user(username="+56922222222", password="x")
        paciente1 = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56911111111", user=user1)
        Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222", user=user2)

        self.client.force_authenticate(user=user1)
        respuesta = self.client.get("/api/pacientes/")

        assert respuesta.status_code == 200
        assert len(respuesta.data) == 1
        assert respuesta.data[0]["id"] == paciente1.pk

    def test_ficha_clinica_staff_ve_todas_y_filtra_por_paciente(self):
        staff = User.objects.create_user(username="staffA", password="x", is_staff=True)
        paciente1 = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56911111111")
        paciente2 = Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")
        ficha1 = FichaClinica.objects.get(paciente=paciente1)

        self.client.force_authenticate(user=staff)
        respuesta = self.client.get("/api/fichas-clinicas/")
        assert respuesta.status_code == 200
        assert len(respuesta.data) == 2

        respuesta_filtrada = self.client.get(f"/api/fichas-clinicas/?paciente={paciente1.pk}")
        assert len(respuesta_filtrada.data) == 1
        assert respuesta_filtrada.data[0]["id"] == ficha1.pk

    def test_ficha_clinica_paciente_ve_solo_la_propia(self):
        user = User.objects.create_user(username="+56933333333", password="x")
        paciente = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56933333333", user=user)
        Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")

        self.client.force_authenticate(user=user)
        respuesta = self.client.get("/api/fichas-clinicas/")

        assert respuesta.status_code == 200
        assert len(respuesta.data) == 1
        assert respuesta.data[0]["paciente"] == paciente.pk

    def test_horario_profesional_filtra_por_profesional(self):
        staff = User.objects.create_user(username="staffB", password="x", is_staff=True)
        profesional1 = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        Profesional.objects.create(nombre="Dr. Diaz", especialidad="General")

        self.client.force_authenticate(user=staff)
        respuesta = self.client.get(f"/api/horarios-profesional/?profesional={profesional1.pk}")

        assert respuesta.status_code == 200
        assert len(respuesta.data) == 6
        assert all(h["profesional"] == profesional1.pk for h in respuesta.data)

    def test_citas_filtra_por_estado_y_paciente(self):
        staff = User.objects.create_user(username="staffC", password="x", is_staff=True)
        paciente1 = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56911111111")
        paciente2 = Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")
        profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        Cita.objects.create(
            paciente=paciente1, profesional=profesional, fecha=date.today(),
            hora="09:00", estado="pendiente",
        )
        Cita.objects.create(
            paciente=paciente2, profesional=profesional, fecha=date.today(),
            hora="10:00", estado="confirmada",
        )
        self.client.force_authenticate(user=staff)

        respuesta_estado = self.client.get("/api/citas/?estado=confirmada")
        assert len(respuesta_estado.data) == 1
        assert respuesta_estado.data[0]["estado"] == "confirmada"

        respuesta_paciente = self.client.get(f"/api/citas/?paciente={paciente1.pk}")
        assert len(respuesta_paciente.data) == 1
        assert respuesta_paciente.data[0]["paciente"] == paciente1.pk

    def test_tratamientos_staff_y_paciente_y_filtro(self):
        user = User.objects.create_user(username="+56944444444", password="x")
        paciente = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56944444444", user=user)
        otro_paciente = Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")
        ficha = FichaClinica.objects.get(paciente=paciente)
        ficha_otro = FichaClinica.objects.get(paciente=otro_paciente)
        Tratamiento.objects.create(ficha_clinica=ficha, tipo="Limpieza", costo=20000)
        Tratamiento.objects.create(ficha_clinica=ficha_otro, tipo="Endodoncia", costo=80000)

        self.client.force_authenticate(user=user)
        respuesta = self.client.get("/api/tratamientos/")
        assert respuesta.status_code == 200
        assert len(respuesta.data) == 1
        assert respuesta.data[0]["tipo"] == "Limpieza"

        staff = User.objects.create_user(username="staffD", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta_staff = self.client.get(f"/api/tratamientos/?ficha_clinica={ficha_otro.pk}")
        assert len(respuesta_staff.data) == 1
        assert respuesta_staff.data[0]["tipo"] == "Endodoncia"

    def test_pagos_staff_y_paciente_y_filtro(self):
        user = User.objects.create_user(username="+56955555555", password="x")
        paciente = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56955555555", user=user)
        otro_paciente = Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")
        Pago.objects.create(paciente=paciente, monto=10000, fecha=date.today())
        Pago.objects.create(paciente=otro_paciente, monto=20000, fecha=date.today())

        self.client.force_authenticate(user=user)
        respuesta = self.client.get("/api/pagos/")
        assert respuesta.status_code == 200
        assert len(respuesta.data) == 1

        staff = User.objects.create_user(username="staffE", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta_filtrada = self.client.get(f"/api/pagos/?paciente={otro_paciente.pk}")
        assert len(respuesta_filtrada.data) == 1
        assert respuesta_filtrada.data[0]["paciente"] == otro_paciente.pk


@pytest.mark.django_db
class TestDisponibilidadValidacionParametros:
    def setup_method(self):
        self.client = APIClient()

    def test_sin_parametros_devuelve_400(self):
        respuesta = self.client.get("/api/disponibilidad/")
        assert respuesta.status_code == 400

    def test_fecha_invalida_devuelve_400(self):
        profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        respuesta = self.client.get(
            f"/api/disponibilidad/?profesional={profesional.pk}&fecha=no-es-fecha"
        )
        assert respuesta.status_code == 400


@pytest.mark.django_db
class TestCitaSerializerActualizacion:
    def test_staff_puede_reagendar_su_propia_cita_sin_chocar_consigo_misma(self):
        paciente = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56911111111")
        profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        cita = Cita.objects.create(
            paciente=paciente, profesional=profesional, fecha=date.today(),
            hora="10:00", estado="pendiente",
        )
        staff = User.objects.create_user(username="staffF", password="x", is_staff=True)
        client = APIClient()
        client.force_authenticate(user=staff)

        respuesta = client.patch(f"/api/citas/{cita.pk}/", {"hora": "10:00"})
        assert respuesta.status_code == 200

    def test_staff_crea_cita_exitosamente_sin_conflicto(self):
        paciente = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56911111111")
        profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        staff = User.objects.create_user(username="staffG", password="x", is_staff=True)
        client = APIClient()
        client.force_authenticate(user=staff)

        respuesta = client.post("/api/citas/", {
            "paciente": paciente.pk, "profesional": profesional.pk,
            "fecha": str(date.today()), "hora": "15:00",
        })
        assert respuesta.status_code == 201


@pytest.mark.django_db
def test_str_de_los_modelos():
    user = User.objects.create_user(username="+56966666666", password="x")
    paciente = Paciente.objects.create(
        nombre="Ana Torres", rut="1-9", telefono="+56966666666", user=user
    )
    assert str(paciente) == "Ana Torres"

    ficha = FichaClinica.objects.get(paciente=paciente)
    assert str(ficha) == "Ficha de Ana Torres"

    profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
    assert str(profesional) == "Dra. Soto"

    horario = HorarioProfesional.objects.filter(profesional=profesional, dia_semana=0).first()
    assert str(horario) == "Dra. Soto · Lunes"

    cita = Cita.objects.create(
        paciente=paciente, profesional=profesional, fecha=date(2026, 1, 5), hora=dt_time(9, 0)
    )
    assert str(cita) == "Ana Torres · 2026-01-05 09:00:00"

    tratamiento = Tratamiento.objects.create(ficha_clinica=ficha, tipo="Limpieza", costo=15000)
    assert str(tratamiento) == "Limpieza · Ana Torres"

    pago = Pago.objects.create(paciente=paciente, monto=15000, fecha=date(2026, 1, 5))
    assert str(pago) == "$15000 · Ana Torres"


def test_normalizar_rut_acepta_formatos_variados():
    for valor in ["11.111.111-1", "11111111-1", "11.111.111 - 1", " 11111111-1 "]:
        assert normalizar_rut(valor) == "11111111-1"


def test_normalizar_rut_rechaza_digito_verificador_incorrecto():
    from django.core.exceptions import ValidationError

    with pytest.raises(ValidationError):
        normalizar_rut("11.111.111-2")


def test_normalizar_rut_rechaza_formato_no_numerico():
    from django.core.exceptions import ValidationError

    with pytest.raises(ValidationError):
        normalizar_rut("no-es-un-rut")


@pytest.mark.django_db
class TestReservaPublicaConCuenta:
    def setup_method(self):
        self.client = APIClient()
        self.profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        self.lunes = proximo_lunes()

    def _payload(self, **overrides):
        payload = {
            "nombre": "Ana Torres",
            "rut": "11.111.111-1",
            "telefono": "+56912345678",
            "profesional": self.profesional.pk,
            "fecha": str(self.lunes),
            "hora": "10:00",
        }
        payload.update(overrides)
        return payload

    def test_sin_marcar_crear_cuenta_no_crea_usuario(self):
        respuesta = self.client.post("/api/reservas/", self._payload())
        assert respuesta.status_code == 201
        assert respuesta.data["cuenta_creada"] is False
        paciente = Paciente.objects.get(rut="11111111-1")
        assert paciente.user_id is None

    def test_crear_cuenta_sin_password_es_rechazado(self):
        respuesta = self.client.post("/api/reservas/", self._payload(crear_cuenta=True))
        assert respuesta.status_code == 400
        assert "password" in respuesta.data

    def test_crear_cuenta_con_password_crea_usuario_con_rut_normalizado(self):
        respuesta = self.client.post(
            "/api/reservas/",
            self._payload(crear_cuenta=True, password="unaClaveSegura2026"),
        )
        assert respuesta.status_code == 201
        assert respuesta.data["cuenta_creada"] is True

        paciente = Paciente.objects.get(rut="11111111-1")
        assert paciente.user is not None
        assert paciente.user.username == "11111111-1"
        assert paciente.user.check_password("unaClaveSegura2026")

    def test_reservar_de_nuevo_no_duplica_la_cuenta(self):
        self.client.post(
            "/api/reservas/",
            self._payload(crear_cuenta=True, password="unaClaveSegura2026"),
        )
        respuesta = self.client.post(
            "/api/reservas/",
            self._payload(crear_cuenta=True, password="otraClaveSegura2026", hora="10:30"),
        )
        assert respuesta.status_code == 201
        assert respuesta.data["cuenta_creada"] is False
        assert User.objects.filter(username="11111111-1").count() == 1

    def test_dos_formatos_del_mismo_rut_no_duplican_el_paciente(self):
        self.client.post("/api/reservas/", self._payload(rut="11.111.111-1"))
        respuesta = self.client.post(
            "/api/reservas/", self._payload(rut="11111111-1", hora="11:00")
        )
        assert respuesta.status_code == 201
        assert Paciente.objects.filter(rut="11111111-1").count() == 1

    def test_rut_con_digito_verificador_invalido_es_rechazado(self):
        respuesta = self.client.post("/api/reservas/", self._payload(rut="11.111.111-2"))
        assert respuesta.status_code == 400
