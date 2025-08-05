# Arquivo: backend/ocorrencias/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OcorrenciaSerializer

# Esta View será responsável por criar novas ocorrências
class OcorrenciaCreateView(APIView):
    def post(self, request, format=None):
        # Passa os dados recebidos do frontend para o nosso serializer
        serializer = OcorrenciaSerializer(data=request.data)

        # Verifica se os dados são válidos
        if serializer.is_valid():
            # Salva o novo objeto Ocorrencia no banco de dados
            serializer.save()
            # Retorna uma resposta de sucesso
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Se os dados não forem válidos, retorna os erros
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)