# Arquivo: backend/ocorrencias/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer

# View unificada para Listar (GET) e Criar (POST) Ocorrências
class OcorrenciaListCreateView(APIView):

    def get(self, request, format=None):
        """ Devolve a lista de todas as ocorrências. """
        ocorrencias = Ocorrencia.objects.all().order_by('-data_fato')
        serializer = OcorrenciaSerializer(ocorrencias, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        """ Cria uma nova ocorrência. """
        serializer = OcorrenciaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)