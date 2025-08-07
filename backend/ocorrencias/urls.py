from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OcorrenciaViewSet, 
    OrganizacaoCriminosaViewSet, 
    TipoOcorrenciaViewSet,
    CadernoInformativoViewSet,
    OPMViewSet,
    ModeloArmaViewSet
)

router = DefaultRouter()
router.register(r'ocorrencias', OcorrenciaViewSet, basename='ocorrencia')
router.register(r'organizacoes', OrganizacaoCriminosaViewSet, basename='organizacao')
router.register(r'tipos-ocorrencia', TipoOcorrenciaViewSet, basename='tipoocorrencia')
router.register(r'cadernos', CadernoInformativoViewSet, basename='caderno')
router.register(r'opms', OPMViewSet, basename='opm')
router.register(r'modelos-arma', ModeloArmaViewSet, basename='modeloarma')

urlpatterns = [
    path('', include(router.urls)),
]
