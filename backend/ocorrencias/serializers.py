# Arquivo: backend/ocorrencias/serializers.py
# VERSÃO CORRIGIDA

from rest_framework import serializers
from .models import Ocorrencia

class OcorrenciaSerializer(serializers.ModelSerializer):
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
            'usuario_registro' # <-- ADICIONADO
        ]
        # O campo 'id', 'data_criacao' e 'usuario_registro' serão apenas para leitura
        read_only_fields = ['id', 'data_criacao', 'usuario_registro'] # <-- ADICIONADO