# backend/ocorrencias/admin.py

from django.contrib import admin
from .models import (
    Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, 
    OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, 
    Efetivo, OPM, ModeloArma, ArmaApreendida,
    RISP, AISP, Localidade
)

# --- NOVA CLASSE PARA PERSONALIZAR A EXIBIÇÃO DA OCORRÊNCIA ---
class OcorrenciaAdmin(admin.ModelAdmin):
    # Campos que aparecerão na lista de ocorrências
    list_display = ('id', 'tipo_ocorrencia', 'data_fato', 'cidade', 'bairro', 'opm_area')
    # Adiciona uma barra de pesquisa
    search_fields = ('id', 'descricao_fato', 'cidade', 'bairro')
    # Adiciona um filtro pela data
    list_filter = ('data_fato', 'tipo_ocorrencia', 'opm_area')
    
    # Organiza os campos no formulário de edição
    fieldsets = (
        ('Informações Gerais', {
            'fields': ('tipo_ocorrencia', 'tipo_homicidio', 'caderno_informativo', 'data_fato', 'descricao_fato', 'evolucao_ocorrencia', 'fonte_informacao', 'foto_ocorrencia')
        }),
        ('Localização e Área Policial', {
            'fields': ('cep', 'logradouro', 'bairro', 'cidade', 'uf', 'latitude', 'longitude', 'opm_area', 'aisp_area', 'risp_area')
        }),
        ('Controle do Sistema', {
            'fields': ('usuario_registro',),
        }),
    )
    # Define campos que são apenas para leitura no admin
    readonly_fields = ('aisp_area', 'risp_area', 'usuario_registro')

# Remove o registro antigo e simples
# admin.site.register(Ocorrencia) -> Esta linha é substituída pela de baixo

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
