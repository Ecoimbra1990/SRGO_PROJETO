from rest_framework import viewsets, generics
from .models import Ocorrencia, OrganizacaoCriminosa, TipoOcorrencia
from .serializers import OcorrenciaSerializer, UserSerializer, OrganizacaoCriminosaSerializer, TipoOcorrenciaSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
