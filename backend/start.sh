#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input

# (NOVO) Comando para forçar a limpeza das tabelas da app antes de migrar.
# Isto resolve o erro "relation ... already exists" de forma definitiva.
python manage.py reset_app_db

# Executa as migrações normalmente
python manage.py migrate

# Cria o superusuário inicial (se não existir)
python manage.py create_initial_superuser
