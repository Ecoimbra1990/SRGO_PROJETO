# backend/ocorrencias/admin.py

from django.contrib import admin
from .models import (
    Ocorrencia, PessoaEnvolvida, ProcedimentoPenal, 
    OrganizacaoCriminosa, TipoOcorrencia, CadernoInformativo, 
    Efetivo, OPM, ModeloArma, ArmaApreendida,
    # Imports para os novos modelos
    RISP, AISP, Localidade
)

# Modelos existentes
admin.site.register(Ocorrencia)
admin.site.register(PessoaEnvolvida)
admin.site.register(ProcedimentoPenal)
admin.site.register(OrganizacaoCriminosa)
admin.site.register(TipoOcorrencia)
admin.site.register(CadernoInformativo)
admin.site.register(Efetivo)
admin.site.register(OPM)
admin.site.register(ModeloArma)
admin.site.register(ArmaApreendida)

# Novos modelos para exibir no admin
admin.site.register(RISP)
admin.site.register(AISP)
admin.site.register(Localidade)
