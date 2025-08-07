from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OcorrenciaViewSet, 
    UserCreate, 
    OrganizacaoCriminosaViewSet, 
    TipoOcorrenciaViewSet,
    CadernoInformativoViewSet,
    OPMViewSet # Importe a OPMViewSet
)

router = DefaultRouter()
router.register(r'ocorrencias', OcorrenciaViewSet)
router.register(r'organizacoes', OrganizacaoCriminosaViewSet)
router.register(r'tipos-ocorrencia', TipoOcorrenciaViewSet)
router.register(r'cadernos', CadernoInformativoViewSet)
router.register(r'opms', OPMViewSet) # Adicione o registro da rota

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserCreate.as_view(), name='user_create'),
]
