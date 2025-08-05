# Arquivo: backend/ocorrencias/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Ocorrencia, PessoaEnvolvida
from .serializers import OcorrenciaSerializer, PessoaEnvolvidaSerializer

# View unificada para Listar (GET) e Criar (POST) Ocorrências
class OcorrenciaListCreateView(APIView):
    def get(self, request, format=None):
        ocorrencias = Ocorrencia.objects.all().order_by('-data_fato')
        serializer = OcorrenciaSerializer(ocorrencias, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = OcorrenciaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- NOVA VIEW ---
# View para ver os detalhes de UMA ocorrência específica (incluindo pessoas)
class OcorrenciaDetailView(APIView):
    def get(self, request, pk, format=None):
        try:
            ocorrencia = Ocorrencia.objects.get(pk=pk)
            serializer = OcorrenciaSerializer(ocorrencia)
            return Response(serializer.data)
        except Ocorrencia.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

# --- NOVA VIEW ---
# View para adicionar uma Pessoa a uma Ocorrência existente
class PessoaEnvolvidaCreateView(APIView):
    def post(self, request, pk, format=None):
        # Encontra a ocorrência a que queremos adicionar a pessoa
        try:
            ocorrencia = Ocorrencia.objects.get(pk=pk)
        except Ocorrencia.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Adiciona a referência à ocorrência nos dados antes de validar
        request.data['ocorrencia'] = ocorrencia.pk
        serializer = PessoaEnvolvidaSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)