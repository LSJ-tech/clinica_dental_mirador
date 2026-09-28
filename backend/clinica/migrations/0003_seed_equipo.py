from django.contrib.auth.hashers import make_password
from django.db import migrations

# Usuario = primera letra del nombre + apellido paterno, mismo criterio que
# ya usa PataAgenda (gestion/usuarios.py) para sus cuentas autogeneradas.
EQUIPO_USUARIOS = ["mjauregui", "jgonzalez", "mlorca", "mreyes", "cguaico", "pgonzalez"]

CLAVE_INICIAL = "mirador2026"

PROFESIONALES = [
    {
        "nombre": "Dra. Jenniffer González R.",
        "especialidad": "Odontología general, odontopediatría y estética facial",
    },
    {"nombre": "Dra. María José Lorca", "especialidad": "Endodoncia"},
    {"nombre": "Dra. Muriel Reyes L.", "especialidad": "Odontología general y estética facial"},
]


def crear_equipo(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Profesional = apps.get_model("clinica", "Profesional")
    HorarioProfesional = apps.get_model("clinica", "HorarioProfesional")

    # Password puesta solo al crear el usuario -- si ya existe (por ejemplo
    # porque el staff ya la cambió desde el panel), no se toca.
    for username in EQUIPO_USUARIOS:
        if not User.objects.filter(username=username).exists():
            User.objects.create(
                username=username, password=make_password(CLAVE_INICIAL), is_staff=True
            )

    for datos in PROFESIONALES:
        profesional, creado = Profesional.objects.get_or_create(
            nombre=datos["nombre"], defaults={"especialidad": datos["especialidad"]}
        )
        if creado:
            # Se crea a mano en vez de confiar en la señal post_save: una
            # migración de datos usa el modelo histórico (apps.get_model),
            # que no dispara las señales conectadas al modelo real.
            HorarioProfesional.objects.bulk_create([
                HorarioProfesional(
                    profesional=profesional, dia_semana=dia, hora_inicio="09:00", hora_fin="18:00"
                )
                for dia in range(6)
            ])


def no_hacer_nada(apps, schema_editor):
    # A propósito no se borra nada al revertir: son datos reales del
    # equipo, no un fixture de prueba descartable.
    pass


class Migration(migrations.Migration):
    dependencies = [("clinica", "0002_cita_motivo_horarioprofesional")]
    operations = [migrations.RunPython(crear_equipo, no_hacer_nada)]
