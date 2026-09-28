from datetime import date

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APITestCase

from .models import Cita, FichaClinica, Paciente, Profesional
from .validators import normalizar_telefono_cl


class NormalizarTelefonoTest(TestCase):
    def test_variantes_validas_se_normalizan_igual(self):
        for valor in ["+56 9 1234 5678", "56912345678", "9 1234 5678", "(9)1234-5678"]:
            self.assertEqual(normalizar_telefono_cl(valor), "+56912345678")

    def test_telefono_invalido_lanza_error(self):
        with self.assertRaises(ValidationError):
            normalizar_telefono_cl("123")


class CitaApiPermisosTest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="+56911111111", password="x")
        self.user2 = User.objects.create_user(username="+56922222222", password="x")
        self.paciente1 = Paciente.objects.create(
            nombre="Ana", rut="1-9", telefono="+56911111111", user=self.user1
        )
        self.paciente2 = Paciente.objects.create(
            nombre="Luis", rut="2-7", telefono="+56922222222", user=self.user2
        )
        self.profesional = Profesional.objects.create(
            nombre="Dra. Soto", especialidad="Odontología general", box_asignado="1"
        )
        Cita.objects.create(
            paciente=self.paciente1, profesional=self.profesional,
            fecha=date.today(), hora="10:00", estado="pendiente", box="1",
        )
        Cita.objects.create(
            paciente=self.paciente2, profesional=self.profesional,
            fecha=date.today(), hora="11:00", estado="pendiente", box="1",
        )

    def test_paciente_solo_ve_sus_propias_citas(self):
        self.client.force_authenticate(user=self.user1)
        respuesta = self.client.get("/api/citas/")
        self.assertEqual(len(respuesta.data), 1)
        self.assertEqual(respuesta.data[0]["paciente"], self.paciente1.pk)

    def test_anonimo_recibe_401(self):
        respuesta = self.client.get("/api/citas/")
        self.assertEqual(respuesta.status_code, 401)

    def test_paciente_no_puede_crear_citas(self):
        self.client.force_authenticate(user=self.user1)
        respuesta = self.client.post("/api/citas/", {
            "paciente": self.paciente1.pk,
            "profesional": self.profesional.pk,
            "fecha": str(date.today()),
            "hora": "12:00",
        })
        self.assertEqual(respuesta.status_code, 403)

    def test_filtro_por_fecha(self):
        staff = User.objects.create_user(username="staff", password="x", is_staff=True)
        Cita.objects.create(
            paciente=self.paciente1, profesional=self.profesional,
            fecha=date(2020, 1, 1), hora="09:00", estado="pendiente", box="1",
        )
        self.client.force_authenticate(user=staff)
        respuesta = self.client.get(f"/api/citas/?fecha={date.today()}")
        self.assertEqual(len(respuesta.data), 2)

    def test_cita_incluye_nombres_anidados(self):
        self.client.force_authenticate(user=self.user1)
        respuesta = self.client.get("/api/citas/")
        self.assertEqual(respuesta.data[0]["paciente_nombre"], "Ana")
        self.assertEqual(respuesta.data[0]["profesional_nombre"], "Dra. Soto")


class FichaClinicaAutoCreadaTest(TestCase):
    def test_se_crea_ficha_al_crear_paciente(self):
        paciente = Paciente.objects.create(nombre="Nueva", rut="3-5", telefono="+56933333333")
        self.assertTrue(FichaClinica.objects.filter(paciente=paciente).exists())


class MeViewTest(APITestCase):
    def test_me_para_staff(self):
        staff = User.objects.create_user(username="staff2", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta = self.client.get("/api/me/")
        self.assertEqual(respuesta.data, {"is_staff": True, "paciente": None})

    def test_me_para_paciente(self):
        user = User.objects.create_user(username="+56944444444", password="x")
        Paciente.objects.create(nombre="Pedro", rut="4-3", telefono="+56944444444", user=user)
        self.client.force_authenticate(user=user)
        respuesta = self.client.get("/api/me/")
        self.assertFalse(respuesta.data["is_staff"])
        self.assertEqual(respuesta.data["paciente"]["nombre"], "Pedro")

    def test_q_filtra_pacientes(self):
        staff = User.objects.create_user(username="staff3", password="x", is_staff=True)
        Paciente.objects.create(nombre="Zoe Rojas", rut="5-1", telefono="+56955555555")
        Paciente.objects.create(nombre="Marco Diaz", rut="6-K", telefono="+56966666666")
        self.client.force_authenticate(user=staff)
        respuesta = self.client.get("/api/pacientes/?q=Zoe")
        self.assertEqual(len(respuesta.data), 1)
        self.assertEqual(respuesta.data[0]["nombre"], "Zoe Rojas")
