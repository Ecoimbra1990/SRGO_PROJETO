from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OcorrenciaViewSet, 
    OrganizacaoCriminosaViewSet, 
    TipoOcorrenciaViewSet,
    CadernoInformativoViewSet,
    OPMViewSet,
    ModeloArmaViewSet,
    LocalidadeViewSet,
    GerarCadernoPDFView,
    GerarCadernoPorFiltroPDFView, # Adicionado
    DashboardAnalyticsView,
    ModalidadeCrimeViewSet
)

router = DefaultRouter()
router.register(r'ocorrencias', OcorrenciaViewSet, basename='ocorrencia')
router.register(r'organizacoes', OrganizacaoCriminosaViewSet, basename='organizacao')
router.register(r'tipos-ocorrencia', TipoOcorrenciaViewSet, basename='tipoocorrencia')
router.register(r'cadernos', CadernoInformativoViewSet, basename='caderno')
router.register(r'opms', OPMViewSet, basename='opm')
router.register(r'modelos-arma', ModeloArmaViewSet, basename='modeloarma')
router.register(r'localidades', LocalidadeViewSet, basename='localidade')
router.register(r'modalidades-crime', ModalidadeCrimeViewSet, basename='modalidadecrime')

urlpatterns = [
    path('', include(router.urls)),
    path('gerar-caderno-pdf/', GerarCadernoPDFView.as_view(), name='gerar_caderno_pdf'),
    # Nova rota para geração por filtro
    path('gerar-caderno-por-filtro/', GerarCadernoPorFiltroPDFView.as_view(), name='gerar_caderno_por_filtro'),
    path('dashboard-analytics/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
]
