# Arquivo: backend/ocorrencias/urls.py
# VERSÃO CORRIGIDA

from django.urls import path
# Importa APENAS a view que existe atualmente
from .views import OcorrenciaListCreateView

urlpatterns = [
    # A URL /api/ocorrencias/ agora aponta corretamente para a única view que temos
    path('ocorrencias/', OcorrenciaListCreateView.as_view(), name='ocorrencia-list-create'),
]