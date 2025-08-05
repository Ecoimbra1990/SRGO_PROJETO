# Arquivo: backend/ocorrencias/views.py
# VERSÃO FINAL E CORRIGIDA

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny # <-- ADICIONE ESTA IMPORTAÇÃO
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer

# View unificada para Listar (GET) e Criar (POST) Ocorrências
class OcorrenciaListCreateView(APIView):
    # ADICIONE ESTA LINHA: permite que qualquer pessoa (incluindo o seu frontend) aceda a esta view
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        """ Devolve a lista de todas as ocorrências. """
        ocorrencias = Ocorrencia.objects.all().order_by('-data_fato')
        serializer = OcorrenciaSerializer(ocorrencias, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        """ Cria uma nova ocorrência. """
        serializer = OcorrenciaSerializer(data=request.data)
        if serializer.is_valid():
            # A lógica para associar o utilizador (se logado) permanece
            if request.user.is_authenticated:
                serializer.save(usuario_registro=request.user)
            else:
                serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)