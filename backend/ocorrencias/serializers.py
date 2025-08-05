from rest_framework import serializers
from .models import Ocorrencia, PessoaEnvolvida, ProcedimentoPenal
from django.contrib.auth.models import User

class ProcedimentoPenalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcedimentoPenal
        fields = ['id', 'numero_processo', 'vara_tribunal', 'status', 'detalhes']

class PessoaEnvolvidaSerializer(serializers.ModelSerializer):
    procedimentos = ProcedimentoPenalSerializer(many=True, required=False)

    class Meta:
        model = PessoaEnvolvida
        fields = ['id', 'nome', 'documento', 'tipo_envolvimento', 'observacoes', 'procedimentos']

class OcorrenciaSerializer(serializers.ModelSerializer):
    envolvidos = PessoaEnvolvidaSerializer(many=True, required=False)
    usuario_registro_username = serializers.ReadOnlyField(source='usuario_registro.username')

    class Meta:
        model = Ocorrencia
        fields = [
            'id', 'tipo_ocorrencia', 'data_fato', 'descricao_fato',
            'fonte_informacao', 'caderno_informativo', 'evolucao_ocorrencia',
            'usuario_registro', 'usuario_registro_username', 'data_criacao',
            'cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude',
            'envolvidos'
        ]
        read_only_fields = ['usuario_registro']

    def create(self, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        ocorrencia = Ocorrencia.objects.create(**validated_data)
        for envolvido_data in envolvidos_data:
            procedimentos_data = envolvido_data.pop('procedimentos', [])
            pessoa = PessoaEnvolvida.objects.create(ocorrencia=ocorrencia, **envolvido_data)
            for procedimento_data in procedimentos_data:
                ProcedimentoPenal.objects.create(pessoa_envolvida=pessoa, **procedimento_data)
        return ocorrencia

    def update(self, instance, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        instance = super().update(instance, validated_data)

        instance.envolvidos.all().delete()
        for envolvido_data in envolvidos_data:
            procedimentos_data = envolvido_data.pop('procedimentos', [])
            pessoa = PessoaEnvolvida.objects.create(ocorrencia=instance, **envolvido_data)
            for procedimento_data in procedimentos_data:
                ProcedimentoPenal.objects.create(pessoa_envolvida=pessoa, **procedimento_data)
            
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
