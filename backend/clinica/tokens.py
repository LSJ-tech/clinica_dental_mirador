from django.core import signing

# Firmado (no cifrado): cualquiera puede leer el contenido, pero no puede
# fabricar un token válido sin la SECRET_KEY del servidor. Alcanza porque el
# único dato que lleva es el id de la cita, no información sensible.
_SALT = "clinica.confirmar-cita"
_MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 60  # 60 días: de sobra para cualquier cita agendada


def generar_token_confirmacion(cita_id):
    return signing.dumps({"cita_id": cita_id}, salt=_SALT)


def leer_token_confirmacion(token):
    """Devuelve el cita_id del token, o None si es inválido/expiró/fue alterado."""
    try:
        datos = signing.loads(token, salt=_SALT, max_age=_MAX_AGE_SEGUNDOS)
    except signing.BadSignature:
        return None
    return datos.get("cita_id")
