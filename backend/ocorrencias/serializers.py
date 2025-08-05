# Arquivo: backend/ocorrencias/serializers.py

from rest_framework import serializers
# Importe todos os modelos necessários
from .models import Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, OrganizacaoCriminosa

class ProcedimentoPenalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcedimentoPenal
        fields = '__all__'

class PessoaEnvolvidaSerializer(serializers.ModelSerializer):
    # Aninha os procedimentos penais dentro da pessoa envolvida
    procedimentos = ProcedimentoPenalSerializer(many=True, read_only=True)

    class Meta:
        model = PessoaEnvolvida
        fields = '__all__'

class OcorrenciaSerializer(serializers.ModelSerializer):
    # Aninha a lista de pessoas envolvidas dentro da ocorrência
    pessoas_envolvidas = PessoaEnvolvidaSerializer(many=True, read_only=True)

    class Meta:
        model = Ocorrencia
        # Lista os campos que serão aceites e enviados pela API
        fields = [
            'id', 
            'tipo_ocorrencia', 
            'data_fato', 
            'descricao_fato', 
            'endereco_localizacao',
            'fonte_informacao',
            'caderno_informativo',
            'data_criacao',
            'pessoas_envolvidas' # Adiciona o novo campo
        ]
        read_only_fields = ['id', 'data_criacao']