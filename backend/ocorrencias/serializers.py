from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class OPMSerializer(serializers.ModelSerializer):
    class Meta:
        model = OPM
        fields = ['id', 'nome']
# Adicione estas classes ao serializers.py, pode ser a seguir ao OPMSerializer

class RISPSerializer(serializers.ModelSerializer):
    class Meta:
        model = RISP
        fields = ['id', 'nome', 'coordenadoria']

class AISPSerializer(serializers.ModelSerializer):
    risp = RISPSerializer(read_only=True)
    class Meta:
        model = AISP
        fields = ['id', 'nome', 'risp']

class LocalidadeSerializer(serializers.ModelSerializer):
    # Para mostrar os nomes em vez de apenas os IDs
    opm_nome = serializers.CharField(source='opm.nome', read_only=True)
    aisp_nome = serializers.CharField(source='opm.aisp.nome', read_only=True)
    risp_nome = serializers.CharField(source='opm.aisp.risp.nome', read_only=True)

    class Meta:
        model = Localidade
        # Incluímos o id da opm para poder ser usado no formulário
        fields = ['id', 'municipio_bairro', 'opm', 'opm_nome', 'aisp_nome', 'risp_nome']

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

class ModeloArmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeloArma
        fields = ['id', 'modelo', 'tipo', 'marca', 'calibre']

class ArmaApreendidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArmaApreendida
        fields = ['id', 'tipo', 'marca', 'modelo', 'calibre', 'numero_serie', 'observacoes', 'modelo_catalogado']

class OcorrenciaSerializer(serializers.ModelSerializer):
    envolvidos = PessoaEnvolvidaSerializer(many=True, required=False)
    armas_apreendidas = ArmaApreendidaSerializer(many=True, required=False)
    
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
            'envolvidos', 'armas_apreendidas'
        ]
        read_only_fields = ['usuario_registro']

    def get_usuario_registro_nome_completo(self, obj):
        if obj.usuario_registro:
            full_name = obj.usuario_registro.get_full_name()
            if full_name:
                return full_name
            try:
                efetivo = Efetivo.objects.get(matricula=obj.usuario_registro.username)
                return efetivo.nome
            except Efetivo.DoesNotExist:
                return obj.usuario_registro.username
        return None

    def _handle_armas(self, ocorrencia, armas_data):
        """
        Lida com o registo de armas e aprende novos modelos para o catálogo.
        """
        for arma_data in armas_data:
            # Se a arma foi inserida manualmente (sem link para o catálogo)
            if not arma_data.get('modelo_catalogado'):
                # Verifica se o modelo já existe no catálogo ou cria um novo.
                # O .upper() garante a padronização para evitar duplicados.
                modelo_obj, created = ModeloArma.objects.get_or_create(
                    modelo=arma_data['modelo'].upper(),
                    defaults={
                        'marca': arma_data.get('marca', '').upper(),
                        'calibre': arma_data.get('calibre', '').upper(),
                        'tipo': arma_data.get('tipo', 'FOGO')
                    }
                )
                # Associa a arma apreendida ao item do catálogo (existente ou novo)
                arma_data['modelo_catalogado'] = modelo_obj
            
            ArmaApreendida.objects.create(ocorrencia=ocorrencia, **arma_data)

    def create(self, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        armas_data = validated_data.pop('armas_apreendidas', [])
        ocorrencia = Ocorrencia.objects.create(**validated_data)

        for envolvido_data in envolvidos_data:
            PessoaEnvolvida.objects.create(ocorrencia=ocorrencia, **envolvido_data)
        
        self._handle_armas(ocorrencia, armas_data)
            
        return ocorrencia

    def update(self, instance, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        armas_data = validated_data.pop('armas_apreendidas', [])
        
        instance = super().update(instance, validated_data)
        
        # Atualiza Pessoas Envolvidas
        instance.envolvidos.all().delete()
        for envolvido_data in envolvidos_data:
            PessoaEnvolvida.objects.create(ocorrencia=instance, **envolvido_data)

        # Atualiza Armas Apreendidas
        instance.armas_apreendidas.all().delete()
        self._handle_armas(instance, armas_data)
            
        return instance

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
