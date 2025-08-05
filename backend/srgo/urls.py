# Arquivo: backend/srgo/urls.py
# VERSÃO CORRETA E FINAL

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Esta linha ativa o painel de administração
    path('admin/', admin.site.urls),

    # Esta linha conecta todas as URLs da sua aplicação de ocorrências ao prefixo /api/
    # Ela direciona o tráfego para o ficheiro 'ocorrencias/urls.py'
    path('api/', include('ocorrencias.urls')),
]