# Arquivo: backend/ocorrencias/urls.py

from django.urls import path
from .views import OcorrenciaListCreateView

urlpatterns = [
    # A URL /api/ocorrencias/ agora aceita tanto GET para listar como POST para criar.
    path('ocorrencias/', OcorrenciaListCreateView.as_view(), name='ocorrencia-list-create'),
]