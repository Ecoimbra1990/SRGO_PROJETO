# Arquivo: backend/srgo/urls.py

from django.contrib import admin
from django.urls import path, include  # Garanta que 'include' está importado

urlpatterns = [
    path('admin/', admin.site.urls),
    # Conecta todas as URLs do nosso app de ocorrências ao prefixo /api/
    path('api/', include('ocorrencias.urls')),
]