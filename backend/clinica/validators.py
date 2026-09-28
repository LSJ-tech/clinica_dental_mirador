import re

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

telefono_validator = RegexValidator(
    regex=r"^[\d\s()+-]{7,20}$",
    message="Ingresa un teléfono válido (mínimo 7 dígitos, solo números, espacios, + o -).",
)

TELEFONO_CL_REGEX = re.compile(r"(?:\+?56)?(\d{9})$")


def normalizar_telefono_cl(valor):
    """
    Deja el teléfono en formato +56XXXXXXXXX, acepte o no el +56 de entrada.
    Mismo criterio que peluqueria_mascota (gestion/models.py), reutilizado
    acá porque el teléfono también es el username de Paciente.user.
    """
    limpio = re.sub(r"[\s()-]", "", valor or "")
    match = TELEFONO_CL_REGEX.fullmatch(limpio)
    if not match:
        raise ValidationError(
            "Ingresa un teléfono chileno válido, con o sin +56 (ej: +56 9 1234 5678)."
        )
    return f"+56{match.group(1)}"


def normalizar_rut(valor):
    """
    Deja el RUT en formato "12345678-9" (sin puntos, un solo guion, K
    mayúscula) y valida el dígito verificador (módulo 11). Se usa tanto
    para el RUT del paciente -- evita duplicados por formato distinto,
    ej. "11.111.111-1" vs "11111111-1" -- como para el username cuando
    el paciente crea cuenta al reservar, así el mismo RUT normaliza
    siempre igual al hacer login después.
    """
    limpio = re.sub(r"[.\s-]", "", (valor or "").upper())
    if len(limpio) < 2 or not limpio[:-1].isdigit():
        raise ValidationError("Ingresa un RUT válido.")
    cuerpo, dv = limpio[:-1], limpio[-1]
    suma = 0
    multiplicador = 2
    for digito in reversed(cuerpo):
        suma += int(digito) * multiplicador
        multiplicador = multiplicador + 1 if multiplicador < 7 else 2
    resto = 11 - (suma % 11)
    dv_esperado = {11: "0", 10: "K"}.get(resto, str(resto))
    if dv != dv_esperado:
        raise ValidationError("Ingresa un RUT válido.")
    return f"{cuerpo}-{dv}"
