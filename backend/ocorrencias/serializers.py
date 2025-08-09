# backend/ocorrencias/serializers.py

from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
import json
from .google_drive_utils import upload_to_drive

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

class ModalidadeCrimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModalidadeCrime
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
            'id', 'nome', 'sexo', 'status', 'tipo_documento', 'documento', 
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
    envolvidos = PessoaEnvolvidaSerializer(many=True, required=False, read_only=True)
    armas_apreendidas = ArmaApreendidaSerializer(many=True, required=False, read_only=True)
    
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
        if obj.usuario_registro:
            full_name = obj.usuario_registro.get_full_name()
            if full_name: return full_name
            try:
                efetivo = Efetivo.objects.get(matricula=obj.usuario_registro.username)
                return efetivo.nome
            except Efetivo.DoesNotExist:
                return obj.usuario_registro.username
        return None

    def _handle_nested_data(self, request_data, field_name):
        field_data = request_data.get(field_name)
        if field_data and isinstance(field_data, str):
            try:
                return json.loads(field_data)
            except json.JSONDecodeError:
                return []
        return field_data if field_data else []

    def create(self, validated_data):
        foto_file = validated_data.pop('foto_ocorrencia_upload', None)
        if foto_file:
            foto_url = upload_to_drive(foto_file)
            if foto_url:
                validated_data['foto_ocorrencia'] = foto_url

        request = self.context.get('request')
        envolvidos_data = self._handle_nested_data(request.data, 'envolvidos')
        armas_data = self._handle_nested_data(request.data, 'armas_apreendidas')

        ocorrencia = Ocorrencia.objects.create(**validated_data)

        for envolvido_data in envolvidos_data:
            envolvido_data.pop('procedimentos', None)
            PessoaEnvolvida.objects.create(ocorrencia=ocorrencia, **envolvido_data)
        
        for arma_data in armas_data:
            ArmaApreendida.objects.create(ocorrencia=ocorrencia, **arma_data)
        
        return ocorrencia

    def update(self, instance, validated_data):
        foto_file = validated_data.pop('foto_ocorrencia_upload', None)
        if foto_file:
            foto_url = upload_to_drive(foto_file)
            if foto_url:
                instance.foto_ocorrencia = foto_url

        request = self.context.get('request')
        envolvidos_data = self._handle_nested_data(request.data, 'envolvidos')
        armas_data = self._handle_nested_data(request.data, 'armas_apreendidas')

        instance = super().update(instance, validated_data)
        
        instance.envolvidos.all().delete()
        for envolvido_data in envolvidos_data:
            envolvido_data.pop('procedimentos', None)
            PessoaEnvolvida.objects.create(ocorrencia=instance, **envolvido_data)

        instance.armas_apreendidas.all().delete()
        for arma_data in armas_data:
            ArmaApreendida.objects.create(ocorrencia=instance, **arma_data)
            
        return instance

class UserRegistrationSerializer(serializers.Serializer):
    matricula = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)
    def validate_matricula(self, value):
        if not Efetivo.objects
