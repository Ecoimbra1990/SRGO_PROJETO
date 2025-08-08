# backend/srgo/urls.py

from django.contrib import admin
from django.urls import path, include
# --- NOVOS IMPORTS ---
from django.conf import settings
from django.conf.urls.static import static
# --- FIM DOS NOVOS IMPORTS ---
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserCreate

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rotas de Autenticação e Registro
    path('api/register/', UserCreate.as_view(), name='user_create'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Inclui todas as outras rotas do app 'ocorrencias' sob o prefixo 'api/'
    path('api/', include('ocorrencias.urls')),
]

# --- NOVA LINHA PARA SERVIR FICHEIROS DE MÉDIA EM DESENVOLVIMENTO ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
