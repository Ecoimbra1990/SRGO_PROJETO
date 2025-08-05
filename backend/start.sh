#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input

# Executa as migrações do banco de dados.
# Com uma base de dados nova, este comando irá criar todas as tabelas do zero.
python manage.py migrate

# Cria o superusuário inicial (se não existir)
python manage.py create_initial_superuser
