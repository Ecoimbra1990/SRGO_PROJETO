# Arquivo: backend/ocorrencias/views.py
# VERSÃO FINAL DE DIAGNÓSTICO

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer
import traceback # Importa o módulo para rastreamento de erros

class OcorrenciaListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        try:
            ocorrencias = Ocorrencia.objects.all().order_by('-data_fato')
            serializer = OcorrenciaSerializer(ocorrencias, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Se qualquer erro acontecer, devolve o erro exato como texto
            return Response(
                {"erro": "Um erro interno ocorreu ao listar ocorrências.", "detalhes": str(e), "traceback": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, format=None):
        try:
            serializer = OcorrenciaSerializer(data=request.data)
            if serializer.is_valid():
                if request.user.is_authenticated:
                    serializer.save(usuario_registro=request.user)
                else:
                    serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            # Se a validação falhar, devolve os erros de validação
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Se qualquer outro erro acontecer, devolve o erro exato como texto
            return Response(
                {"erro": "Um erro interno ocorreu ao criar a ocorrência.", "detalhes": str(e), "traceback": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )