#!/usr/bin/env bash
# Script de build para Render. Se ejecuta en cada deploy.
set -o errexit

# --only-binary evita que pip ejecute setup.py/scripts de build arbitrarios de
# paquetes que no publican wheel -- todas las dependencias de requirements.txt
# sí publican wheel, así que esto no debería cambiar nada del install.
pip install --only-binary :all: -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Crea el superusuario (staff de la clínica con acceso a /admin/) si no existe.
# No hace nada si DJANGO_SUPERUSER_USERNAME/PASSWORD no están definidas (por
# ejemplo, en local). Reemplaza al "python manage.py createsuperuser"
# interactivo, que necesita Shell access (plan pago) para poder ejecutarse.
python manage.py shell -c "
import os
from django.contrib.auth.models import User

username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')

if username and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superusuario {username!r} creado.')
"
