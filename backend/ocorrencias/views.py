from rest_framework import viewsets, permissions
from .models import Natureza, Ocorrencia, Efetivo
from .serializers import NaturezaSerializer, OcorrenciaSerializer, EfetivoSerializer

class NaturezaViewSet(viewsets.ModelViewSet):
    queryset = Natureza.objects.all()
    serializer_class = NaturezaSerializer
    permission_classes = [permissions.IsAuthenticated]

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all()
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

class EfetivoViewSet(viewsets.ModelViewSet):
    queryset = Efetivo.objects.all()
    serializer_class = EfetivoSerializer
    permission_classes = [permissions.IsAuthenticated]
