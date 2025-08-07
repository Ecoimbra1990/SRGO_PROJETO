# backend/srgo/views.py

from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from ocorrencias.serializers import UserRegistrationSerializer # Importa o serializer do app 'ocorrencias'

class UserCreate(generics.CreateAPIView):
    """
    Endpoint para criar novos usuários.
    Acessível por qualquer pessoa (AllowAny).
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Sobrescreve o método create para retornar uma mensagem de sucesso personalizada.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({"message": "Utilizador registado com sucesso!"}, status=201, headers=headers)
