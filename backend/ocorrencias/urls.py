# Arquivo: backend/ocorrencias/urls.py

from django.urls import path
from .views import OcorrenciaCreateView

urlpatterns = [
    # Quando uma requisição POST for feita para /api/ocorrencias/, 
    # ela será gerenciada pela OcorrenciaCreateView
    path('ocorrencias/', OcorrenciaCreateView.as_view(), name='ocorrencia-create'),
]