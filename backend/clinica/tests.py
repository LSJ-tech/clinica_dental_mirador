from datetime import date, timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core import mail
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Cita, FichaClinica, HorarioProfesional, Paciente, Profesional
from .tokens import generar_token_confirmacion
from .validators import normalizar_telefono_cl


def proximo_lunes():
    hoy = date.today()
    return hoy + timedelta(days=(7 - hoy.weekday()) % 7 or 7)


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
        self.assertEqual(respuesta.data, {"is_staff": True, "is_superuser": False, "paciente": None})

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

    def test_me_marca_superusuario(self):
        admin = User.objects.create_superuser(username="admin1", password="x", email="a@a.com")
        self.client.force_authenticate(user=admin)
        respuesta = self.client.get("/api/me/")
        self.assertTrue(respuesta.data["is_superuser"])


class EliminarPacienteTest(APITestCase):
    def setUp(self):
        self.paciente = Paciente.objects.create(nombre="Rosa", rut="7-4", telefono="+56977777777")

    def test_staff_normal_no_puede_eliminar_paciente(self):
        staff = User.objects.create_user(username="staffh", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta = self.client.delete(f"/api/pacientes/{self.paciente.id}/")
        self.assertEqual(respuesta.status_code, 403)
        self.assertTrue(Paciente.objects.filter(id=self.paciente.id).exists())

    def test_paciente_no_puede_eliminar_paciente(self):
        user = User.objects.create_user(username="+56988888888", password="x")
        Paciente.objects.create(nombre="Cliente", rut="8-2", telefono="+56988888888", user=user)
        self.client.force_authenticate(user=user)
        respuesta = self.client.delete(f"/api/pacientes/{self.paciente.id}/")
        self.assertEqual(respuesta.status_code, 403)
        self.assertTrue(Paciente.objects.filter(id=self.paciente.id).exists())

    def test_anonimo_no_puede_eliminar_paciente(self):
        respuesta = self.client.delete(f"/api/pacientes/{self.paciente.id}/")
        self.assertIn(respuesta.status_code, (401, 403))
        self.assertTrue(Paciente.objects.filter(id=self.paciente.id).exists())

    def test_superusuario_puede_eliminar_paciente(self):
        admin = User.objects.create_superuser(username="admin2", password="x", email="a2@a.com")
        self.client.force_authenticate(user=admin)
        respuesta = self.client.delete(f"/api/pacientes/{self.paciente.id}/")
        self.assertEqual(respuesta.status_code, 204)
        self.assertFalse(Paciente.objects.filter(id=self.paciente.id).exists())

    def test_superusuario_elimina_en_cascada_ficha_citas_pagos(self):
        profesional = Profesional.objects.create(
            nombre="Dra. Soto", especialidad="Odontología general", box_asignado="1"
        )
        Cita.objects.create(
            paciente=self.paciente, profesional=profesional,
            fecha=date.today(), hora="10:00", estado="pendiente", box="1",
        )
        ficha_id = self.paciente.ficha_clinica.id

        admin = User.objects.create_superuser(username="admin3", password="x", email="a3@a.com")
        self.client.force_authenticate(user=admin)
        respuesta = self.client.delete(f"/api/pacientes/{self.paciente.id}/")

        self.assertEqual(respuesta.status_code, 204)
        self.assertFalse(FichaClinica.objects.filter(id=ficha_id).exists())
        self.assertFalse(Cita.objects.filter(paciente_id=self.paciente.id).exists())


class ResetearPasswordPacienteTest(APITestCase):
    def setUp(self):
        self.user_paciente = User.objects.create_user(username="9-8", password="claveVieja123")
        self.paciente = Paciente.objects.create(
            nombre="Rosa", rut="9-8", telefono="+56977777788", user=self.user_paciente
        )
        self.paciente_sin_cuenta = Paciente.objects.create(
            nombre="Sin Cuenta", rut="10-6", telefono="+56977777799"
        )

    def test_staff_normal_puede_resetear_password_de_paciente(self):
        staff = User.objects.create_user(username="staffreset", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta = self.client.post(f"/api/pacientes/{self.paciente.id}/resetear_password/")
        self.assertEqual(respuesta.status_code, 200)
        password_temporal = respuesta.data["password_temporal"]
        self.assertTrue(len(password_temporal) >= 8)

        self.user_paciente.refresh_from_db()
        self.assertTrue(self.user_paciente.check_password(password_temporal))
        self.assertFalse(self.user_paciente.check_password("claveVieja123"))

    def test_paciente_no_puede_resetear_password(self):
        self.client.force_authenticate(user=self.user_paciente)
        respuesta = self.client.post(f"/api/pacientes/{self.paciente.id}/resetear_password/")
        self.assertEqual(respuesta.status_code, 403)

    def test_anonimo_no_puede_resetear_password(self):
        respuesta = self.client.post(f"/api/pacientes/{self.paciente.id}/resetear_password/")
        self.assertIn(respuesta.status_code, (401, 403))

    def test_resetear_password_sin_cuenta_da_error(self):
        staff = User.objects.create_user(username="staffreset2", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta = self.client.post(
            f"/api/pacientes/{self.paciente_sin_cuenta.id}/resetear_password/"
        )
        self.assertEqual(respuesta.status_code, 400)

    def test_serializer_expone_tiene_cuenta(self):
        staff = User.objects.create_user(username="staffreset3", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta = self.client.get(f"/api/pacientes/{self.paciente.id}/")
        self.assertTrue(respuesta.data["tiene_cuenta"])
        respuesta_sin = self.client.get(f"/api/pacientes/{self.paciente_sin_cuenta.id}/")
        self.assertFalse(respuesta_sin.data["tiene_cuenta"])


class ProfesionalPublicoTest(APITestCase):
    def test_lista_profesionales_sin_autenticar(self):
        # No se asume un total absoluto: la migración 0003 siembra el
        # equipo real, así que otros Profesional ya existen en la BD.
        antes = Profesional.objects.count()
        Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        respuesta = self.client.get("/api/profesionales/")
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(len(respuesta.data), antes + 1)

    def test_crear_profesional_siembra_horario_lunes_a_sabado(self):
        profesional = Profesional.objects.create(nombre="Dr. Soto", especialidad="General")
        self.assertEqual(HorarioProfesional.objects.filter(profesional=profesional).count(), 6)
        self.assertFalse(
            HorarioProfesional.objects.filter(profesional=profesional, dia_semana=6).exists()
        )


class DisponibilidadYReservaTest(APITestCase):
    def setUp(self):
        self.profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        self.lunes = proximo_lunes()

    def test_disponibilidad_lista_bloques_de_30_min(self):
        respuesta = self.client.get(
            f"/api/disponibilidad/?profesional={self.profesional.pk}&fecha={self.lunes}"
        )
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data["slots"][0], "09:00")
        self.assertEqual(respuesta.data["slots"][-1], "17:30")
        self.assertEqual(len(respuesta.data["slots"]), 18)

    def test_dia_sin_horario_no_tiene_slots(self):
        domingo = self.lunes + timedelta(days=6)
        respuesta = self.client.get(
            f"/api/disponibilidad/?profesional={self.profesional.pk}&fecha={domingo}"
        )
        self.assertEqual(respuesta.data["slots"], [])

    def test_reserva_publica_crea_paciente_y_cita_confirmada(self):
        respuesta = self.client.post("/api/reservas/", {
            "nombre": "Ana Torres",
            "rut": "11.111.111-1",
            "telefono": "+56 9 1234 5678",
            "email": "ana@example.com",
            "profesional": self.profesional.pk,
            "fecha": str(self.lunes),
            "hora": "10:00",
            "motivo": "Limpieza",
        })
        self.assertEqual(respuesta.status_code, 201)
        # Confirmada de inmediato (no "pendiente"): bloquea la hora para
        # cualquier otro paciente apenas se crea.
        self.assertEqual(respuesta.data["estado"], "confirmada")
        paciente = Paciente.objects.get(rut="11111111-1")
        self.assertEqual(paciente.telefono, "+56912345678")
        cita = Cita.objects.get(paciente=paciente)
        self.assertEqual(cita.motivo, "Limpieza")

    def test_reserva_publica_sin_email_es_rechazada(self):
        respuesta = self.client.post("/api/reservas/", {
            "nombre": "Ana Torres", "rut": "11.111.111-1", "telefono": "+56912345678",
            "profesional": self.profesional.pk, "fecha": str(self.lunes), "hora": "10:00",
        })
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn("email", respuesta.data)

    def test_reserva_publica_actualiza_email_de_paciente_existente_sin_email(self):
        Paciente.objects.create(nombre="Ana Torres", rut="11111111-1", telefono="+56912345678")
        respuesta = self.client.post("/api/reservas/", {
            "nombre": "Ana Torres", "rut": "11.111.111-1", "telefono": "+56912345678",
            "email": "ana@example.com",
            "profesional": self.profesional.pk, "fecha": str(self.lunes), "hora": "10:00",
        })
        self.assertEqual(respuesta.status_code, 201)
        paciente = Paciente.objects.get(rut="11111111-1")
        self.assertEqual(paciente.email, "ana@example.com")

    def test_reserva_publica_rechaza_horario_ocupado(self):
        paciente = Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")
        Cita.objects.create(
            paciente=paciente, profesional=self.profesional,
            fecha=self.lunes, hora="10:00", estado="pendiente",
        )
        respuesta = self.client.post("/api/reservas/", {
            "nombre": "Ana Torres", "rut": "11.111.111-1", "telefono": "+56912345678",
            "email": "ana@example.com",
            "profesional": self.profesional.pk, "fecha": str(self.lunes), "hora": "10:00",
        })
        self.assertEqual(respuesta.status_code, 400)

    def test_reserva_publica_rechaza_fuera_de_horario(self):
        respuesta = self.client.post("/api/reservas/", {
            "nombre": "Ana Torres", "rut": "11.111.111-1", "telefono": "+56912345678",
            "email": "ana@example.com",
            "profesional": self.profesional.pk, "fecha": str(self.lunes), "hora": "20:00",
        })
        self.assertEqual(respuesta.status_code, 400)

    def test_staff_no_puede_duplicar_hora_de_otra_cita(self):
        paciente1 = Paciente.objects.create(nombre="Luis", rut="2-7", telefono="+56922222222")
        paciente2 = Paciente.objects.create(nombre="Ana", rut="1-9", telefono="+56911111111")
        Cita.objects.create(
            paciente=paciente1, profesional=self.profesional,
            fecha=self.lunes, hora="10:00", estado="pendiente",
        )
        staff = User.objects.create_user(username="staff4", password="x", is_staff=True)
        self.client.force_authenticate(user=staff)
        respuesta = self.client.post("/api/citas/", {
            "paciente": paciente2.pk, "profesional": self.profesional.pk,
            "fecha": str(self.lunes), "hora": "10:00",
        })
        self.assertEqual(respuesta.status_code, 400)

    def test_reserva_publica_con_email_envia_confirmacion_y_notifica_a_la_clinica(self):
        respuesta = self.client.post("/api/reservas/", {
            "nombre": "Ana Torres", "rut": "11.111.111-1", "telefono": "+56912345678",
            "email": "ana@example.com",
            "profesional": self.profesional.pk, "fecha": str(self.lunes), "hora": "10:00",
        })
        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(len(mail.outbox), 2)
        destinatarios = [correo.to[0] for correo in mail.outbox]
        self.assertIn("ana@example.com", destinatarios)
        self.assertIn("contacto@devquad.cl", destinatarios)
        paciente = Paciente.objects.get(rut="11111111-1")
        self.assertEqual(paciente.email, "ana@example.com")


class ConfirmarCitaTest(APITestCase):
    def setUp(self):
        self.paciente = Paciente.objects.create(
            nombre="Ana", rut="1-9", telefono="+56911111111", email="ana@example.com"
        )
        self.profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        self.cita = Cita.objects.create(
            paciente=self.paciente, profesional=self.profesional,
            fecha=date.today() + timedelta(days=1), hora="10:00", estado="pendiente",
        )

    def test_token_valido_confirma_cita_pendiente(self):
        token = generar_token_confirmacion(self.cita.id)
        respuesta = self.client.get(f"/api/confirmar-cita/{token}/")
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data["estado"], "confirmada")
        self.cita.refresh_from_db()
        self.assertEqual(self.cita.estado, "confirmada")

    def test_token_invalido_rechazado(self):
        respuesta = self.client.get("/api/confirmar-cita/token-basura/")
        self.assertEqual(respuesta.status_code, 400)

    def test_token_de_cita_inexistente(self):
        token = generar_token_confirmacion(999999)
        respuesta = self.client.get(f"/api/confirmar-cita/{token}/")
        self.assertEqual(respuesta.status_code, 404)

    def test_no_reabre_cita_cancelada(self):
        self.cita.estado = "cancelada"
        self.cita.save(update_fields=["estado"])
        token = generar_token_confirmacion(self.cita.id)
        respuesta = self.client.get(f"/api/confirmar-cita/{token}/")
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data["estado"], "cancelada")
        self.cita.refresh_from_db()
        self.assertEqual(self.cita.estado, "cancelada")


class EnviarRecordatoriosCommandTest(TestCase):
    def setUp(self):
        self.profesional = Profesional.objects.create(nombre="Dra. Soto", especialidad="General")
        self.manana = timezone.localdate() + timedelta(days=1)

    def test_envia_solo_a_citas_de_manana_con_email_y_pendientes_de_recordatorio(self):
        con_email = Paciente.objects.create(
            nombre="Con Email", rut="1-9", telefono="+56911111111", email="con@example.com"
        )
        sin_email = Paciente.objects.create(
            nombre="Sin Email", rut="2-7", telefono="+56922222222"
        )
        cita_manana = Cita.objects.create(
            paciente=con_email, profesional=self.profesional,
            fecha=self.manana, hora="10:00", estado="pendiente",
        )
        Cita.objects.create(
            paciente=sin_email, profesional=self.profesional,
            fecha=self.manana, hora="11:00", estado="pendiente",
        )
        Cita.objects.create(
            paciente=con_email, profesional=self.profesional,
            fecha=self.manana + timedelta(days=1), hora="10:00", estado="pendiente",
        )

        call_command("enviar_recordatorios")

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["con@example.com"])
        cita_manana.refresh_from_db()
        self.assertEqual(cita_manana.recordatorio_estado, "enviado")
        self.assertIsNotNone(cita_manana.recordatorio_enviado_at)

    def test_no_reenvia_si_ya_fue_enviado(self):
        paciente = Paciente.objects.create(
            nombre="Con Email", rut="1-9", telefono="+56911111111", email="con@example.com"
        )
        Cita.objects.create(
            paciente=paciente, profesional=self.profesional,
            fecha=self.manana, hora="10:00", estado="pendiente",
            recordatorio_estado="enviado",
        )
        call_command("enviar_recordatorios")
        self.assertEqual(len(mail.outbox), 0)

    def test_no_envia_a_cita_cancelada(self):
        paciente = Paciente.objects.create(
            nombre="Con Email", rut="1-9", telefono="+56911111111", email="con@example.com"
        )
        Cita.objects.create(
            paciente=paciente, profesional=self.profesional,
            fecha=self.manana, hora="10:00", estado="cancelada",
        )
        call_command("enviar_recordatorios")
        self.assertEqual(len(mail.outbox), 0)

    def test_marca_fallido_si_el_envio_lanza_una_excepcion(self):
        paciente = Paciente.objects.create(
            nombre="Con Email", rut="1-9", telefono="+56911111111", email="con@example.com"
        )
        cita = Cita.objects.create(
            paciente=paciente, profesional=self.profesional,
            fecha=self.manana, hora="10:00", estado="pendiente",
        )
        with patch("clinica.emails.send_mail", side_effect=Exception("smtp caído")):
            call_command("enviar_recordatorios")
        cita.refresh_from_db()
        self.assertEqual(cita.recordatorio_estado, "fallido")


class CambiarPasswordTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="staff5", password="claveVieja123")
        self.client.force_authenticate(user=self.user)

    def test_cambia_password_con_clave_actual_correcta(self):
        respuesta = self.client.post("/api/cambiar-password/", {
            "password_actual": "claveVieja123",
            "password_nueva": "unaClaveNuevaSegura2026",
        })
        self.assertEqual(respuesta.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("unaClaveNuevaSegura2026"))

    def test_rechaza_clave_actual_incorrecta(self):
        respuesta = self.client.post("/api/cambiar-password/", {
            "password_actual": "claveEquivocada",
            "password_nueva": "unaClaveNuevaSegura2026",
        })
        self.assertEqual(respuesta.status_code, 400)

    def test_rechaza_clave_nueva_demasiado_simple(self):
        respuesta = self.client.post("/api/cambiar-password/", {
            "password_actual": "claveVieja123",
            "password_nueva": "123456",
        })
        self.assertEqual(respuesta.status_code, 400)

    def test_anonimo_no_puede_cambiar_password(self):
        self.client.force_authenticate(user=None)
        respuesta = self.client.post("/api/cambiar-password/", {
            "password_actual": "x", "password_nueva": "otraClaveSegura2026",
        })
        self.assertEqual(respuesta.status_code, 401)


class SeedEquipoTest(TestCase):
    def test_migracion_crea_usuarios_y_profesionales_del_equipo(self):
        for username in ["mjauregui", "jgonzalez", "mlorca", "mreyes", "cguaico", "pgonzalez"]:
            usuario = User.objects.get(username=username)
            self.assertTrue(usuario.is_staff)
            self.assertTrue(usuario.check_password("mirador2026"))

        for nombre in ["Dra. Jenniffer González R.", "Dra. María José Lorca", "Dra. Muriel Reyes L."]:
            profesional = Profesional.objects.get(nombre=nombre)
            self.assertEqual(
                HorarioProfesional.objects.filter(profesional=profesional).count(), 6
            )
