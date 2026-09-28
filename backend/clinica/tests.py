from datetime import date

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APITestCase

from .models import Cita, Paciente, Profesional
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
