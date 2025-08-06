#!/usr/bin/env bash
# exit on error
#set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

# Executa as migrações. Com uma base de dados nova,
# este comando irá criar todas as tabelas do zero.
python manage.py migrate

# Cria o superusuário (se não existir)
python manage.py create_initial_superuser

# Popula a tabela Efetivo a partir do Google Sheets
python manage.py populate_efetivo

# Inicia o servidor web
gunicorn srgo.wsgi --bind 0.0.0.0:$PORT
