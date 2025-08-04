# Arquivo: backend/ocorrencias/management/commands/create_initial_superuser.py

import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates a superuser non-interactively using environment variables'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not all([username, email, password]):
            self.stdout.write(self.style.ERROR('As variáveis de ambiente DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL e DJANGO_SUPERUSER_PASSWORD devem ser definidas.'))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'Superusuário "{username}" já existe.'))
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Superusuário "{username}" criado com sucesso.'))