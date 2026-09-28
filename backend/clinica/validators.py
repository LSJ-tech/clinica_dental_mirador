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
