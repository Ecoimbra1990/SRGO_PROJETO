# backend/ocorrencias/admin.py

from django.contrib import admin
from .models import (
    Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, 
    OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, 
    Efetivo, OPM, ModeloArma, ArmaApreendida,
    RISP, AISP, Localidade
)

class OcorrenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_ocorrencia', 'data_fato', 'cidade', 'bairro', 'opm_area')
    search_fields = ('id', 'descricao_fato', 'cidade', 'bairro')
    list_filter = ('data_fato', 'tipo_ocorrencia', 'opm_area')
    
    fieldsets = (
        ('Informações Gerais', {
            # --- CAMPO 'tipo_homicidio' ADICIONADO AQUI ---
            'fields': ('tipo_ocorrencia', 'tipo_homicidio', 'caderno_informativo', 'data_fato', 'descricao_fato', 'evolucao_ocorrencia', 'fonte_informacao', 'foto_ocorrencia')
        }),
        ('Localização e Área Policial', {
            'fields': ('cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude', 'opm_area', 'aisp_area', 'risp_area')
        }),
        ('Controle do Sistema', {
            'fields': ('usuario_registro',),
        }),
    )
    readonly_fields = ('aisp_area', 'risp_area', 'usuario_registro')

admin.site.register(Ocorrencia, OcorrenciaAdmin)

# Registros dos outros modelos (sem alterações)
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
