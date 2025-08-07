#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Executa os comandos de gerenciamento do Django
python manage.py collectstatic --no-input
python manage.py migrate

# Os comandos abaixo só precisam ser executados uma vez ou quando os dados mudam.
# Comentá-los evita problemas de timeout durante o deploy.
# python manage.py create_initial_superuser
# python manage.py populate_efetivo
# python manage.py populate_armas
# python manage.py populate_areas

# Inicia o servidor web
gunicorn srgo.wsgi:application --bind 0.0.0.0:$PORT
