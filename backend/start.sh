#!/usr/bin/env bash
# exit on error
set -o errexit

# Instala as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --no-input

# O comando '--fake' diz ao Django para redefinir o histórico de migrações
# da app 'ocorrencias' sem alterar a base de dados.
# Isto é útil para resolver estados inconsistentes.
echo "--- Redefinindo o histórico de migrações para a app 'ocorrencias' ---"
python manage.py migrate ocorrencias zero --fake

# Agora, executa as migrações normalmente. Como o histórico foi redefinido,
# o Django irá aplicar a migração inicial e criar todas as tabelas corretamente.
echo "--- Executando todas as migrações pendentes ---"
python manage.py migrate

# Cria o superusuário inicial (se não existir)
python manage.py create_initial_superuser
