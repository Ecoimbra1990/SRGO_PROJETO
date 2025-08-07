# backend/ocorrencias/serializers.py

from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class OPMSerializer(serializers.ModelSerializer):
    class Meta:
        model = OPM
        fields = ['id', 'nome']

class OrganizacaoCriminosaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizacaoCriminosa
        fields = ['id', 'nome']

class TipoOcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoOcorrencia
        fields = ['id', 'nome']

class CadernoInformativoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CadernoInformativo
        fields = ['id', 'nome']

class ProcedimentoPenalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcedimentoPenal
        fields = ['id', 'numero_processo', 'vara_tribunal', 'status', 'detalhes']

class PessoaEnvolvidaSerializer(serializers.ModelSerializer):
    procedimentos = ProcedimentoPenalSerializer(many=True, required=False)
    organizacao_criminosa = serializers.PrimaryKeyRelatedField(queryset=OrganizacaoCriminosa.objects.all(), allow_null=True, required=False)
    organizacao_criminosa_nome = serializers.CharField(source='organizacao_criminosa.nome', read_only=True, allow_null=True)

    class Meta:
        model = PessoaEnvolvida
        fields = ['id', 'nome', 'documento', 'tipo_envolvimento', 'observacoes', 'organizacao_criminosa', 'organizacao_criminosa_nome', 'procedimentos']

class OcorrenciaSerializer(serializers.ModelSerializer):
    envolvidos = PessoaEnvolvidaSerializer(many=True, required=False)
    usuario_registro_username = serializers.ReadOnlyField(source='usuario_registro.username')
    usuario_registro_nome_completo = serializers.SerializerMethodField()
    
    tipo_ocorrencia = serializers.PrimaryKeyRelatedField(queryset=TipoOcorrencia.objects.all(), allow_null=True)
    tipo_ocorrencia_nome = serializers.CharField(source='tipo_ocorrencia.nome', read_only=True, allow_null=True)
    caderno_informativo = serializers.PrimaryKeyRelatedField(queryset=CadernoInformativo.objects.all(), allow_null=True, required=False)
    caderno_informativo_nome = serializers.CharField(source='caderno_informativo.nome', read_only=True, allow_null=True)
    opm_area = serializers.PrimaryKeyRelatedField(queryset=OPM.objects.all(), allow_null=True, required=False)
    opm_area_nome = serializers.CharField(source='opm_area.nome', read_only=True, allow_null=True)

    class Meta:
        model = Ocorrencia
        fields = [
            'id', 'tipo_ocorrencia', 'tipo_ocorrencia_nome', 
            'caderno_informativo', 'caderno_informativo_nome',
            'opm_area', 'opm_area_nome',
            'data_fato', 'descricao_fato', 'fonte_informacao', 'evolucao_ocorrencia',
            'usuario_registro', 'usuario_registro_username', 'usuario_registro_nome_completo',
            'cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude',
            'envolvidos'
        ]
        read_only_fields = ['usuario_registro']

    def get_usuario_registro_nome_completo(self, obj):
        if obj.usuario_registro:
            # Tenta buscar o nome completo no modelo User
            full_name = obj.usuario_registro.get_full_name()
            if full_name:
                return full_name
            # Se não houver, busca na tabela Efetivo como fallback
            try:
                efetivo = Efetivo.objects.get(matricula=obj.usuario_registro.username)
                return efetivo.nome
            except Efetivo.DoesNotExist:
                return obj.usuario_registro.username # Retorna a matrícula se não encontrar
        return None

    def _create_or_update_nested(self, instance, envolvidos_data):
        # Limpa os envolvidos existentes para evitar duplicatas ao atualizar
        instance.envolvidos.all().delete() 
        for envolvido_data in envolvidos_data:
            procedimentos_data = envolvido_data.pop('procedimentos', [])
            pessoa = PessoaEnvolvida.objects.create(ocorrencia=instance, **envolvido_data)
            for procedimento_data in procedimentos_data:
                ProcedimentoPenal.objects.create(pessoa_envolvida=pessoa, **procedimento_data)

    def create(self, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        ocorrencia = Ocorrencia.objects.create(**validated_data)
        self._create_or_update_nested(ocorrencia, envolvidos_data)
        return ocorrencia

    def update(self, instance, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        instance = super().update(instance, validated_data)
        self._create_or_update_nested(instance, envolvidos_data)
        return instance

# Serializer para o registro de novos usuários
class UserRegistrationSerializer(serializers.Serializer):
    matricula = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)

    def validate_matricula(self, value):
        if not Efetivo.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Matrícula não encontrada no efetivo.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Utilizador com esta matrícula já registado.")
        return value

    def create(self, validated_data):
        efetivo_data = Efetivo.objects.get(matricula=validated_data['matricula'])
        nome_completo = efetivo_data.nome.split()
        user = User.objects.create_user(
            username=validated_data['matricula'],
            password=validated_data['password'],
            first_name=nome_completo[0],
            last_name=' '.join(nome_completo[1:]) if len(nome_completo) > 1 else ''
        )
        return user
