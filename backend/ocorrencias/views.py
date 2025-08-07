# backend/ocorrencias/views.py

from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from .models import Ocorrencia, OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, OPM, Efetivo
from .serializers import (
    OcorrenciaSerializer, 
    UserRegistrationSerializer, 
    OrganizacaoCriminosaSerializer, 
    TipoOcorrenciaSerializer,
    CadernoInformativoSerializer,
    OPMSerializer
)
from django.contrib.auth.models import User

# View para registrar novos usuários
class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({"message": "Utilizador registado com sucesso!"}, status=201, headers=headers)

# ViewSet para Ocorrências
class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all().order_by('-data_criacao')
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario_registro=self.request.user)

# ViewSet para Organizações Criminosas
class OrganizacaoCriminosaViewSet(viewsets.ModelViewSet):
    queryset = OrganizacaoCriminosa.objects.all().order_by('nome')
    serializer_class = OrganizacaoCriminosaSerializer
    permission_classes = [permissions.IsAuthenticated]

# ViewSet para Tipos de Ocorrência
class TipoOcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = TipoOcorrencia.objects.all().order_by('nome')
    serializer_class = TipoOcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

# ViewSet para Cadernos Informativos
class CadernoInformativoViewSet(viewsets.ModelViewSet):
    queryset = CadernoInformativo.objects.all().order_by('nome')
    serializer_class = CadernoInformativoSerializer
    permission_classes = [permissions.IsAuthenticated]

# ViewSet para OPMs
class OPMViewSet(viewsets.ModelViewSet):
    queryset = OPM.objects.all().order_by('nome')
    serializer_class = OPMSerializer
    permission_classes = [permissions.IsAuthenticated]
   
# --- NOVA VIEWSET PARA O CATÁLOGO DE ARMAS ---
class ModeloArmaViewSet(viewsets.ModelViewSet):
    queryset = ModeloArma.objects.all().order_by('modelo')
    serializer_class = ModeloArmaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['modelo', 'marca', 'calibre']
