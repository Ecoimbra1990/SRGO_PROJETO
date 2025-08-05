from rest_framework import viewsets, generics
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

# View para registrar um novo usuário
class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # Permite que qualquer um se registre

# ViewSet para as Ocorrências
class OcorrenciaViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows ocorrencias to be viewed or edited.
    """
    queryset = Ocorrencia.objects.all().order_by('-data_criacao') # CORREÇÃO APLICADA AQUI
    serializer_class = OcorrenciaSerializer
    permission_classes = [IsAuthenticated] # Exige autenticação para acessar
