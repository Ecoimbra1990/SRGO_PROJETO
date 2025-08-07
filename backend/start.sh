#!/usr/bin/env bash
# exit on error
set -o errexit

# Adicionado para garantir que nenhum arquivo compilado antigo seja usado
echo "--- Limpando arquivos .pyc antigos ---"
find . -type f -name "*.pyc" -delete

# Instala as dependências
echo "--- Instalando dependências ---"
pip install -r requirements.txt

# Executa os comandos de gerenciamento do Django
echo "--- Executando comandos do Django ---"
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py create_initial_superuser
python manage.py populate_efetivo

# Inicia o servidor
echo "--- Iniciando o servidor Gunicorn ---"
gunicorn srgo.wsgi:application --bind 0.0.0.0:$PORT
