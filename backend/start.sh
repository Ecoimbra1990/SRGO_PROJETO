#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

echo "--- Limpando tabelas da app 'ocorrencias' ---"
python manage.py reset_app_db

echo "--- Redefinindo o histórico de migrações ---"
python manage.py migrate ocorrencias zero --fake

echo "--- Aplicando migrações ---"
python manage.py migrate

echo "--- Criando superusuário ---"
python manage.py create_initial_superuser

# (NOVO) Popula a tabela Efetivo a partir do Google Sheets
echo "--- Populando tabela Efetivo ---"
python manage.py populate_efetivo

echo "--- Iniciando o servidor Gunicorn ---"
gunicorn srgo.wsgi
