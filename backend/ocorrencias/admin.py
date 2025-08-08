from django.contrib import admin
from .models import (
    Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, 
    OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, 
    Efetivo, OPM, ModeloArma, ArmaApreendida,
    RISP, AISP, Localidade, ModalidadeCrime # Importa o novo modelo
)

class OcorrenciaAdmin(admin.ModelAdmin):
    # ... (código existente da OcorrenciaAdmin - sem alterações)
    list_display = ('id', 'tipo_ocorrencia', 'data_fato', 'cidade', 'bairro', 'opm_area')
    search_fields = ('id', 'descricao_fato', 'cidade', 'bairro')
    list_filter = ('data_fato', 'tipo_ocorrencia', 'opm_area')
    
    fields = [
        'tipo_ocorrencia', 'tipo_homicidio', 'caderno_informativo', 'data_fato', 
        'descricao_fato', 'evolucao_ocorrencia', 'fonte_informacao', 'foto_ocorrencia',
        'cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude', 
        'opm_area', 'aisp_area', 'risp_area', 'usuario_registro'
    ]
    readonly_fields = ('aisp_area', 'risp_area', 'usuario_registro')

admin.site.register(Ocorrencia, OcorrenciaAdmin)
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

# --- REGISTO DO NOVO MODELO ---
admin.site.register(ModalidadeCrime)
