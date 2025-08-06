from rest_framework import serializers
from .models import Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, Efetivo
from django.contrib.auth.models import User

# NOVO SERIALIZER PARA O REGISTO
class UserRegistrationSerializer(serializers.Serializer):
    matricula = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)

    def validate_matricula(self, value):
        # Validação 1: Verifica se a matrícula existe no efetivo
        if not Efetivo.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Matrícula não encontrada no efetivo.")
        
        # Validação 2: Verifica se já existe um utilizador com esta matrícula
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Utilizador com esta matrícula já registado.")
            
        return value

    def create(self, validated_data):
        matricula = validated_data['matricula']
        password = validated_data['password']
        
        # Busca os dados do efetivo para preencher o nome do utilizador
        efetivo_data = Efetivo.objects.get(matricula=matricula)
        
        nome_completo = efetivo_data.nome.split()
        first_name = nome_completo[0]
        last_name = ' '.join(nome_completo[1:]) if len(nome_completo) > 1 else ''

        user = User.objects.create_user(
            username=matricula,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        return user

# --- Serializers existentes (sem alterações, apenas para contexto) ---

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
    tipo_ocorrencia = serializers.PrimaryKeyRelatedField(queryset=TipoOcorrencia.objects.all(), allow_null=True)
    tipo_ocorrencia_nome = serializers.CharField(source='tipo_ocorrencia.nome', read_only=True, allow_null=True)
    caderno_informativo = serializers.PrimaryKeyRelatedField(queryset=CadernoInformativo.objects.all(), allow_null=True, required=False)
    caderno_informativo_nome = serializers.CharField(source='caderno_informativo.nome', read_only=True, allow_null=True)

    class Meta:
        model = Ocorrencia
        fields = [
            'id', 'tipo_ocorrencia', 'tipo_ocorrencia_nome', 
            'caderno_informativo', 'caderno_informativo_nome',
            'data_fato', 'descricao_fato', 'fonte_informacao', 'evolucao_ocorrencia',
            'usuario_registro', 'usuario_registro_username', 'data_criacao',
            'cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude',
            'envolvidos'
        ]
        read_only_fields = ['usuario_registro']

    def _create_or_update_nested(self, instance, envolvidos_data):
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
