# backend/ocorrencias/serializers.py

from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
import json
from .google_drive_utils import upload_to_drive

# ... (outros serializers que não mudam: OPMSerializer, RISPSerializer, etc.)

class OcorrenciaSerializer(serializers.ModelSerializer):
    envolvidos = PessoaEnvolvidaSerializer(many=True, read_only=True)
    armas_apreendidas = ArmaApreendidaSerializer(many=True, read_only=True)
    
    usuario_registro_username = serializers.ReadOnlyField(source='usuario_registro.username')
    usuario_registro_nome_completo = serializers.SerializerMethodField()
    opm_area_nome = serializers.CharField(source='opm_area.nome', read_only=True, allow_null=True)
    aisp_area_nome = serializers.CharField(source='aisp_area.nome', read_only=True, allow_null=True)
    risp_area_nome = serializers.CharField(source='risp_area.nome', read_only=True, allow_null=True)
    tipo_ocorrencia_nome = serializers.CharField(source='tipo_ocorrencia.nome', read_only=True, allow_null=True)
    caderno_informativo_nome = serializers.CharField(source='caderno_informativo.nome', read_only=True, allow_null=True)
    tipo_homicidio_nome = serializers.CharField(source='tipo_homicidio.nome', read_only=True, allow_null=True)
    
    foto_ocorrencia_upload = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Ocorrencia
        fields = [
            'id', 'tipo_ocorrencia', 'tipo_ocorrencia_nome', 
            'caderno_informativo', 'caderno_informativo_nome',
            'opm_area', 'opm_area_nome', 'aisp_area', 'aisp_area_nome',
            'risp_area', 'risp_area_nome', 'tipo_homicidio', 'tipo_homicidio_nome',
            'foto_ocorrencia', 'foto_ocorrencia_upload',
            'data_fato', 'descricao_fato', 'fonte_informacao', 'evolucao_ocorrencia',
            'usuario_registro', 'usuario_registro_username', 'usuario_registro_nome_completo',
            'cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude',
            'envolvidos', 'armas_apreendidas'
        ]
        read_only_fields = ['usuario_registro', 'aisp_area', 'risp_area', 'foto_ocorrencia']

    def get_usuario_registro_nome_completo(self, obj):
        # ... (código existente)
        return None

    def _handle_nested_data(self, request_data, field_name):
        # ... (código existente)
        return []

    def create(self, validated_data):
        request = self.context.get('request')
        # CORREÇÃO: Obter o ficheiro diretamente do request.FILES
        foto_file = request.FILES.get('foto_ocorrencia_upload')
        
        validated_data.pop('foto_ocorrencia_upload', None)

        if foto_file:
            foto_url = upload_to_drive(foto_file)
            if foto_url:
                validated_data['foto_ocorrencia'] = foto_url
        
        envolvidos_data = self._handle_nested_data(request.data, 'envolvidos')
        armas_data = self._handle_nested_data(request.data, 'armas_apreendidas')

        ocorrencia = Ocorrencia.objects.create(**validated_data)

        for envolvido_data in envolvidos_data:
            PessoaEnvolvida.objects.create(ocorrencia=ocorrencia, **envolvido_data)
        for arma_data in armas_data:
            ArmaApreendida.objects.create(ocorrencia=ocorrencia, **arma_data)
        
        return ocorrencia

    def update(self, instance, validated_data):
        request = self.context.get('request')
        # CORREÇÃO: Obter o ficheiro diretamente do request.FILES
        foto_file = request.FILES.get('foto_ocorrencia_upload')

        validated_data.pop('foto_ocorrencia_upload', None)

        if foto_file:
            foto_url = upload_to_drive(foto_file)
            if foto_url:
                instance.foto_ocorrencia = foto_url

        envolvidos_data = self._handle_nested_data(request.data, 'envolvidos')
        armas_data = self._handle_nested_data(request.data, 'armas_apreendidas')

        instance = super().update(instance, validated_data)
        
        if 'envolvidos' in request.data:
            instance.envolvidos.all().delete()
            for envolvido_data in envolvidos_data:
                PessoaEnvolvida.objects.create(ocorrencia=instance, **envolvido_data)

        if 'armas_apreendidas' in request.data:
            instance.armas_apreendidas.all().delete()
            for arma_data in armas_data:
                ArmaApreendida.objects.create(ocorrencia=instance, **arma_data)
            
        instance.save()
        return instance

class UserRegistrationSerializer(serializers.Serializer):
    # ... (código existente)
    pass
