from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

# ... (serializers OPM, OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, ProcedimentoPenal, PessoaEnvolvida) ...

# --- NOVOS SERIALIZERS PARA ARMAS ---
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
            'id', 'tipo_ocorrencia', 'tipo_ocorrencia_nome', 'caderno_informativo', 'caderno_informativo_nome',
            'opm_area', 'opm_area_nome', 'data_fato', 'descricao_fato', 'fonte_informacao', 'evolucao_ocorrencia',
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

    def _create_or_update_nested(self, instance, nested_data, nested_model, related_name, nested_serializer_model):
        getattr(instance, related_name).all().delete()
        for item_data in nested_data:
            nested_model.objects.create(**{nested_serializer_model: instance, **item_data})

    def create(self, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        armas_data = validated_data.pop('armas_apreendidas', [])
        ocorrencia = Ocorrencia.objects.create(**validated_data)
        self._create_or_update_nested(ocorrencia, envolvidos_data, PessoaEnvolvida, 'envolvidos', 'ocorrencia')
        self._create_or_update_nested(ocorrencia, armas_data, ArmaApreendida, 'armas_apreendidas', 'ocorrencia')
        return ocorrencia

    def update(self, instance, validated_data):
        envolvidos_data = validated_data.pop('envolvidos', [])
        armas_data = validated_data.pop('armas_apreendidas', [])
        instance = super().update(instance, validated_data)
        self._create_or_update_nested(instance, envolvidos_data, PessoaEnvolvida, 'envolvidos', 'ocorrencia')
        self._create_or_update_nested(instance, armas_data, ArmaApreendida, 'armas_apreendidas', 'ocorrencia')
        return instance
