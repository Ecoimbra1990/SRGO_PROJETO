#!/usr/bin/env bash

# Executa as migrações da base de dados
python manage.py migrate

# Inicia o servidor Gunicorn
gunicorn srgo.wsgi:application