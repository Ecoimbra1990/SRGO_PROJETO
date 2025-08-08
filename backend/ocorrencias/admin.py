# backend/ocorrencias/admin.py

from django.contrib import admin
from .models import (
    Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, 
    OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, 
    Efetivo, OPM, ModeloArma, ArmaApreendida,
    RISP, AISP, Localidade
)

# --- CLASSE ATUALIZADA COM UMA NOVA ABORDAGEM ---
class OcorrenciaAdmin(admin.ModelAdmin):
    # Configuração para a lista de ocorrências (sem alterações)
    list_display = ('id', 'tipo_ocorrencia', 'data_fato', 'cidade', 'bairro', 'opm_area')
    search_fields = ('id', 'descricao_fato', 'cidade', 'bairro')
    list_filter = ('data_fato', 'tipo_ocorrencia', 'opm_area')
    
    # --- NOVA ABORDAGEM: Define todos os campos do formulário diretamente ---
    fields = [
        'tipo_ocorrencia', 
        'tipo_homicidio', # Campo que estava em falta
        'caderno_informativo', 
        'data_fato', 
        'descricao_fato', 
        'evolucao_ocorrencia', 
        'fonte_informacao', 
        'foto_ocorrencia',
        'cep', 
        'logradouro', 
        'bairro', 
        'cidade', 
        'uf', 
        'latitude', 
        'longitude', 
        'opm_area', 
        'aisp_area', 
        'risp_area',
        'usuario_registro'
    ]
    
    # Define campos que são apenas para leitura no admin
    readonly_fields = ('aisp_area', 'risp_area', 'usuario_registro')

# Registra a Ocorrência com a classe personalizada
admin.site.register(Ocorrencia, OcorrenciaAdmin)

# --- REGISTROS DOS OUTROS MODELOS (sem alterações) ---
admin.site.register(PessoaEnvolvida)
admin.site.register(ProcedimentoPenal)
admin.site.register(OrganizacaoCriminosa)
admin.site.register(TipoOcorrencia)
admin.site.register(CadernoInformativo)
admin.site.register(Efetivo)
admin.site.register(OPM)
admin.site.register(ModeloArma)
admin.site.register(ArmaApreendida)
admin.site.register(RISP)
admin.site.register(AISP)
admin.site.register(Localidade)
