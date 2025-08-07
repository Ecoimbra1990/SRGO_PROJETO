from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ocorrencia, OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, OPM, ModeloArma
from .serializers import (
    OcorrenciaSerializer, 
    OrganizacaoCriminosaSerializer, 
    TipoOcorrenciaSerializer,
    CadernoInformativoSerializer,
    OPMSerializer,
    ModeloArmaSerializer
)

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all().order_by('-data_criacao')
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'id': ['exact'],
        'opm_area': ['exact'],
        'tipo_ocorrencia': ['exact'],
        'data_fato': ['year', 'month'],
    }
    search_fields = ['bairro', 'descricao_fato']
    ordering_fields = ['data_fato', 'id']
    def perform_create(self, serializer):
        serializer.save(usuario_registro=self.request.user)

class OrganizacaoCriminosaViewSet(viewsets.ModelViewSet):
    queryset = OrganizacaoCriminosa.objects.all().order_by('nome')
    serializer_class = OrganizacaoCriminosaSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoOcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = TipoOcorrencia.objects.all().order_by('nome')
    serializer_class = TipoOcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

class CadernoInformativoViewSet(viewsets.ModelViewSet):
    queryset = CadernoInformativo.objects.all().order_by('nome')
    serializer_class = CadernoInformativoSerializer
    permission_classes = [permissions.IsAuthenticated]

class OPMViewSet(viewsets.ModelViewSet):
    queryset = OPM.objects.all().order_by('nome')
    serializer_class = OPMSerializer
    permission_classes = [permissions.IsAuthenticated]

class ModeloArmaViewSet(viewsets.ModelViewSet):
    queryset = ModeloArma.objects.all().order_by('modelo')
    serializer_class = ModeloArmaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['modelo', 'marca', 'calibre']
