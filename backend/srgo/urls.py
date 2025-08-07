# backend/srgo/urls.py

from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserCreate # Importa a view de registro do local correto

urlpatterns = [
    # Rotas de Autenticação e Registro
    path('api/register/', UserCreate.as_view(), name='user_create'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Inclui todas as outras rotas do app 'ocorrencias' sob o prefixo 'api/'
    path('api/', include('ocorrencias.urls')),
]
