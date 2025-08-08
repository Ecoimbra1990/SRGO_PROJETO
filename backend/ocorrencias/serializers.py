# backend/ocorrencias/serializers.py

from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class OPMSerializer(serializers.ModelSerializer):
    class Meta:
        model = OPM
        fields = ['id', 'nome']

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
    opm_nome = serializers.CharField(source='opm.nome', read_only=True)
    aisp_nome = serializers.CharField(source='opm.aisp.nome', read_only=True)
    risp_nome = serializers.CharField(source='opm.aisp.risp.nome', read_only=True)
    class Meta:
        model = Localidade
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
        fields = [
            'id', 'nome', 'status', 'tipo_documento', 'documento', 
            'tipo_envolvimento', 'observacoes', 'organizacao_criminosa', 
            'organizacao_criminosa_nome', 'procedimentos'
        ]

class ModeloArmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeloArma
        fields = ['id', 'modelo', 'tipo', 'especie', 'marca', 'calibre']

class ArmaApreendidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArmaApreendida
        fields = ['id', 'tipo', 'marca', 'modelo', 'calibre', 'numero_serie', 'observacoes', 'modelo_catalogado']

class OcorrenciaSerializer(serializers.ModelSerializer):
    envolvidos = PessoaEnvolvidaSerializer(many=True, required=False)
    armas_apreendidas = ArmaApreendidaSerializer(many=True, required=False)
    
    usuario_registro_username = serializers.ReadOnlyField(source='usuario_registro.username')
    usuario_registro_nome_completo = serializers.SerializerMethodField()
    
    # Serializers para exibir os nomes das áreas, não apenas os IDs
    opm_area_nome = serializers.CharField(source='opm_area.nome', read_only=True, allow_null=True)
    aisp_area_nome = serializers.CharField(source='aisp_area.nome', read_only=True, allow_null=True)
    risp_area_nome = serializers.CharField(source='risp_area.nome', read_only=True, allow_null=True)
    
    tipo_ocorrencia_nome = serializers.CharField(source='tipo_ocorrencia.nome', read_only=True, allow_null=True)
    caderno_informativo_nome = serializers.CharField(source='caderno_informativo.nome', read_only=True, allow_null=True)

    class Meta:
        model = Ocorrencia
        # --- CAMPOS ATUALIZADOS PARA INCLUIR OS NOVOS ---
        fields = [
            'id', 'tipo_ocorrencia', 'tipo_ocorrencia_nome', 
            'caderno_informativo', 'caderno_informativo_nome',
            'opm_area', 'opm_area_nome', 
            'aisp_area', 'aisp_area_nome', # Adicionado
            'risp_area', 'risp_area_nome', # Adicionado
            'tipo_homicidio', # Adicionado
            'foto_ocorrencia', # Adicionado
            'data_fato', 'descricao_fato', 'fonte_informacao', 'evolucao_ocorrencia',
            'usuario_registro', 'usuario_registro_username', 'usuario_registro_nome_completo',
            'cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude',
            'envolvidos', 'armas_apreendidas'
        ]
        read_only_fields = ['usuario_registro', 'aisp_area', 'risp_area']

    def get_usuario_registro_nome_completo(self, obj):
        if obj.usuario_registro:
            full_name = obj.usuario_registro.get_full_name()
            if full_name: return full_name
            try:
                efetivo = Efetivo.objects.get(matricula=obj.usuario_registro.username)
                return efetivo.
