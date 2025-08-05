# Arquivo: backend/ocorrencias/views.py
# VERSÃO FINAL DE CORREÇÃO

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer

# View unificada para Listar (GET) e Criar (POST) Ocorrências
class OcorrenciaListCreateView(APIView):
    # ESTAS SÃO AS LINHAS CRÍTICAS:
    # 1. Desativa explicitamente qualquer verificação de autenticação (ex: sessão, tokens)
    authentication_classes = []
    # 2. Permite explicitamente o acesso de qualquer pessoa (anónima ou não)
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        """ Devolve a lista de todas as ocorrências. """
        try:
            ocorrencias = Ocorrencia.objects.all().order_by('-data_fato')
            serializer = OcorrenciaSerializer(ocorrencias, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Se algo ainda falhar, isto irá devolver o erro
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, format=None):
        """ Cria uma nova ocorrência. """
        try:
            serializer = OcorrenciaSerializer(data=request.data)
            if serializer.is_valid():
                # A lógica para associar o utilizador (se logado) permanece
                if request.user and request.user.is_authenticated:
                    serializer.save(usuario_registro=request.user)
                else:
                    serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Se algo ainda falhar, isto irá devolver o erro
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)