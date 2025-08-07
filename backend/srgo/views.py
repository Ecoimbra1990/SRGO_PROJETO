# backend/srgo/views.py

from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import serializers

# Este serializador cuidará dos dados para o registro do usuário.
# Ele inclui campos para nome de usuário, senha, e-mail e nome,
# e valida que os dois campos de senha correspondem.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, required=True, label='Confirmar senha'
    )

    class Meta:
        model = User
        # Campos a serem usados para o registro
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        """
        Verifica se as duas senhas inseridas correspondem.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Os campos de senha não correspondem."})
        return attrs

    def create(self, validated_data):
        """
        Cria e retorna um novo usuário.
        """
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        # Criptografa a senha antes de salvar
        user.set_password(validated_data['password'])
        user.save()
        return user

# Esta view usa o RegisterSerializer para criar um novo usuário.
# É uma CreateAPIView, projetada para criar novos objetos.
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Permite que qualquer usuário (autenticado ou não) acesse este endpoint
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


# Estas são views personalizadas para obter e atualizar tokens JWT.
# Estamos estendendo as views padrão do simple-jwt para permitir
# personalização futura, se necessário (por exemplo, adicionar mais dados do usuário ao token).
class CustomTokenObtainPairView(TokenObtainPairView):
    pass

class CustomTokenRefreshView(TokenRefreshView):
    pass
