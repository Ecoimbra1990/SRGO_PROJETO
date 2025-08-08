#!/usr/bin/env bash
# exit on error
set -o errexit

# --- Build do Backend ---
echo "--- Iniciando o build do Backend ---"
cd backend

# Instala as dependências do Python
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input
cd ..

# --- Build do Frontend ---
echo "--- Iniciando o build do Frontend ---"
cd frontend

# Limpa o cache e instala as dependências
echo "--- Limpando o cache e reinstalando as dependências ---"
npm cache clean --force
rm -rf node_modules
npm install

# Constrói a aplicação
echo "--- Construindo a aplicação React ---"
npm run build
