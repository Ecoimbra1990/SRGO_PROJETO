#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input

# --- Bloco de Recuperação da Base de Dados ---
# 1. Força a limpeza das tabelas da app para evitar o erro "already exists".
echo "--- Limpando tabelas da app 'ocorrencias' ---"
python manage.py reset_app_db

# 2. Redefine o histórico de migrações da app para o estado zero.
echo "--- Redefinindo o histórico de migrações ---"
python manage.py migrate ocorrencias zero --fake

# 3. Executa as migrações normalmente. Agora, o Django irá recriar as tabelas do zero.
echo "--- Aplicando migrações ---"
python manage.py migrate

# 4. Cria o superusuário (se não existir)
python manage.py create_initial_superuser

# 5. Inicia o servidor web
echo "--- Iniciando o servidor Gunicorn ---"
gunicorn srgo.wsgi
