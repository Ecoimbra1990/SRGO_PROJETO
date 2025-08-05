#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input

# Executa as migrações. A flag '--fake-initial' resolve o erro de
# "tabela já existe" ao fazer o deploy pela primeira vez ou após um reset.
python manage.py migrate --fake-initial

# Cria o superusuário inicial (se não existir)
python manage.py create_initial_superuser
