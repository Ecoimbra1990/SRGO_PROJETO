from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OcorrenciaViewSet,
    UserCreate,
    OrganizacaoCriminosaViewSet,
    TipoOcorrenciaViewSet,
    CadernoInformativoViewSet,
    OPMViewSet  # Garantir que a OPMViewSet seja importada
)

router = DefaultRouter()
router.register(r'ocorrencias', OcorrenciaViewSet)
router.register(r'organizacoes', OrganizacaoCriminosaViewSet)
router.register(r'tipos-ocorrencia', TipoOcorrenciaViewSet)
router.register(r'cadernos', CadernoInformativoViewSet)
router.register(r'opms', OPMViewSet)  # Esta linha registra a rota /api/opms/

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserCreate.as_view(), name='user_create'),
]
