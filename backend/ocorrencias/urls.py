# Arquivo: backend/ocorrencias/urls.py

from django.urls import path
from .views import OcorrenciaListCreateView, OcorrenciaDetailView, PessoaEnvolvidaCreateView

urlpatterns = [
    # GET (listar todas), POST (criar nova) -> /api/ocorrencias/
    path('ocorrencias/', OcorrenciaListCreateView.as_view(), name='ocorrencia-list-create'),

    # GET (ver detalhes de uma) -> /api/ocorrencias/1/
    path('ocorrencias/<int:pk>/', OcorrenciaDetailView.as_view(), name='ocorrencia-detail'),

    # POST (adicionar pessoa a uma ocorrência) -> /api/ocorrencias/1/add_pessoa/
    path('ocorrencias/<int:pk>/add_pessoa/', PessoaEnvolvidaCreateView.as_view(), name='pessoa-create'),
]