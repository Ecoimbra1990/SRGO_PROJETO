#!/usr/bin/env bash
# exit on error
set -o errexit

# --- PASSO DE DIAGNÓSTICO ---
# Imprime o conteúdo dos ficheiros críticos para o log do deploy.
echo "--- Conteúdo de backend/srgo/urls.py ---"
cat srgo/urls.py
echo "----------------------------------------"
echo "--- Conteúdo de backend/srgo/views.py ---"
cat srgo/views.py
echo "----------------------------------------"

# Limpa ficheiros .pyc antigos para garantir que o código mais novo seja executado
echo "--- Limpando ficheiros .pyc antigos ---"
find . -type f -name "*.pyc" -delete

# Instala as dependências
echo "--- Instalando dependências ---"
pip install -r requirements.txt

# Executa os comandos do Django
echo "--- Executando comandos do Django ---"
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py create_initial_superuser
python manage.py populate_efetivo

# Inicia o servidor
echo "--- Iniciando o servidor Gunicorn ---"
gunicorn srgo.wsgi:application --bind 0.0.0.0:$PORT
