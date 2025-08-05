# Arquivo: backend/ocorrencias/admin.py

from django.contrib import admin
from .models import OrganizacaoCriminosa, Ocorrencia, PessoaEnvolvida, ProcedimentoPenal

# Configuração para melhorar a exibição das Ocorrências no admin
@admin.register(Ocorrencia)
class OcorrenciaAdmin(admin.ModelAdmin):
    list_display = ('tipo_ocorrencia', 'data_fato', 'regiao', 'fonte_informacao')
    list_filter = ('tipo_ocorrencia', 'regiao', 'data_fato')
    search_fields = ('descricao_fato', 'fonte_informacao')
    date_hierarchy = 'data_fato'

# Configuração para melhorar a exibição das Pessoas Envolvidas no admin
@admin.register(PessoaEnvolvida)
class PessoaEnvolvidaAdmin(admin.ModelAdmin):
    list_display = ('nome_completo', 'tipo_envolvimento', 'ocorrencia')
    list_filter = ('tipo_envolvimento',)
    search_fields = ('nome_completo', 'vulgo')
    autocomplete_fields = ('ocorrencia',) # Facilita a busca de ocorrências

# Registra os outros modelos de forma simples
admin.site.register(OrganizacaoCriminosa)
admin.site.register(ProcedimentoPenal)