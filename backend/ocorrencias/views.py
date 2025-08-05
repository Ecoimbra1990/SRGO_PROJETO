# Arquivo: backend/ocorrencias/views.py
# VERSÃO CORRIGIDA

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
            # --- INÍCIO DA CORREÇÃO ---
            # Verifica se o utilizador que fez o pedido está autenticado
            if request.user.is_authenticated:
                # Se estiver, salva a ocorrência associando o utilizador
                serializer.save(usuario_registro=request.user)
            else:
                # Se não estiver (utilizador anónimo), salva sem associar um utilizador
                # O campo na base de dados ficará nulo, o que é permitido
                serializer.save()
            # --- FIM DA CORREÇÃO ---

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)