# Arquivo: backend/ocorrencias/serializers.py

from rest_framework import serializers
from .models import Ocorrencia

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        # Lista os campos que serão aceitos e enviados pela API
        fields = [
            'id', 
            'tipo_ocorrencia', 
            'data_fato', 
            'descricao_fato', 
            'endereco_localizacao',
            'fonte_informacao',
            'caderno_informativo',
            'data_criacao'
        ]
        # O campo 'id' e 'data_criacao' serão apenas para leitura
        read_only_fields = ['id', 'data_criacao']