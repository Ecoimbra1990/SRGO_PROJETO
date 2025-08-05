# Arquivo: backend/srgo/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Esta linha é a que ativa o painel de administração
    path('admin/', admin.site.urls),

    # Esta linha conecta as URLs da sua aplicação de ocorrências
    path('api/', include('ocorrencias.urls')),
]