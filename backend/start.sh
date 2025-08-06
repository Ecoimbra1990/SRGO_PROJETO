#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input

# Executa as migrações. Com uma base de dados nova e o ficheiro de migração correto,
# este comando irá criar todas as tabelas do zero.
python manage.py migrate

# Cria o superusuário (se não existir)
python manage.py create_initial_superuser

# Popula a tabela Efetivo a partir do Google Sheets
python manage.py populate_efetivo

# Inicia o servidor web
gunicorn srgo.wsgi
