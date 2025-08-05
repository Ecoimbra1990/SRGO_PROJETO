#!/usr/bin/env bash
# exit on error
set -o errexit

# --- Build do Frontend ---
echo "--- Iniciando o build do Frontend ---"
cd frontend

# (NOVO) Limpa o cache e instala as dependências do zero
echo "--- Limpando o cache e reinstalando as dependências ---"
npm cache clean --force
rm -rf node_modules
npm install

# Constrói a aplicação
echo "--- Construindo a aplicação React ---"
npm run build

# --- Build do Backend ---
echo "--- Iniciando o build do Backend ---"
cd ../backend

# Instala as dependências do Python
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input
