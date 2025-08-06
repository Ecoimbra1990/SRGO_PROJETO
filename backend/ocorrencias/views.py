from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from .models import Ocorrencia, OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo
from .serializers import (
    OcorrenciaSerializer, UserRegistrationSerializer, OrganizacaoCriminosaSerializer, 
    TipoOcorrenciaSerializer, CadernoInformativoSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

# NOVA VIEW PARA O REGISTO DE UTILIZADORES
class UserCreate(generics.GenericAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Utilizador registado com sucesso!"}, status=status.HTTP_201_CREATED)

# --- ViewSets existentes (sem alterações) ---

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all().order_by('-data_criacao')
    serializer_class = OcorrenciaSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(usuario_registro=self.request.user)

class OrganizacaoCriminosaViewSet(viewsets.ModelViewSet):
    queryset = OrganizacaoCriminosa.objects.all().order_by('nome')
    serializer_class = OrganizacaoCriminosaSerializer
    permission_classes = [IsAuthenticated]

class TipoOcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = TipoOcorrencia.objects.all().order_by('nome')
    serializer_class = TipoOcorrenciaSerializer
    permission_classes = [IsAuthenticated]

class CadernoInformativoViewSet(viewsets.ModelViewSet):
    queryset = CadernoInformativo.objects.all().order_by('nome')
    serializer_class = CadernoInformativoSerializer
    permission_classes = [IsAuthenticated]
