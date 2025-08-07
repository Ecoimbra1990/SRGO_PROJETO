# backend/ocorrencias/models.py

from django.db import models
from django.contrib.auth.models import User

# ... (RISP, AISP, OPM, Localidade, Efetivo, etc. - sem alterações)
class RISP(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    coordenadoria = models.CharField(max_length=255, blank=True, verbose_name="COORPIN")
    def __str__(self): return self.nome

class AISP(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    risp = models.ForeignKey('RISP', on_delete=models.CASCADE, related_name='aisps')
    def __str__(self): return self.nome

class OPM(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    aisp = models.ForeignKey('AISP', on_delete=models.SET_NULL, null=True, blank=True, related_name='opms')
    def __str__(self): return self.nome

class Localidade(models.Model):
    municipio_bairro = models.CharField(max_length=255)
    opm = models.ForeignKey('OPM', on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self): return self.municipio_bairro

class Efetivo(models.Model):
    nome = models.CharField(max_length=255)
    matricula = models.CharField(max_length=30, unique=True)
    posto_graduacao = models.CharField(max_length=50, verbose_name="Posto/Grad.")
    unidade = models.ForeignKey('OPM', on_delete=models.SET_NULL, null=True, blank=True)
    telefone = models.CharField(max_length=30, blank=True, null=True)
    def __str__(self):
        return f"{self.posto_graduacao} {self.nome} - {self.matricula}"

class OrganizacaoCriminosa(models.Model):
    nome = models.CharField(max_length=255, unique=True)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

class TipoOcorrencia(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

class CadernoInformativo(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

class Ocorrencia(models.Model):
    tipo_ocorrencia = models.ForeignKey('TipoOcorrencia', on_delete=models.SET_NULL, null=True)
    caderno_informativo = models.ForeignKey('CadernoInformativo', on_delete=models.SET_NULL, null=True, blank=True)
    opm_area = models.ForeignKey('OPM', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="OPM da Área")
    data_fato = models.DateTimeField()
    descricao_fato = models.TextField()
    fonte_informacao = models.CharField(max_length=200, blank=True)
    evolucao_ocorrencia = models.TextField(blank=True)
    usuario_registro = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    cep = models.CharField(max_length=9, blank=True, null=True)
    logradouro = models.CharField(max_length=255, blank=True, null=True)
    bairro = models.CharField(max_length=100, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    uf = models.CharField(max_length=2, blank=True, null=True)
    latitude = models.CharField(max_length=20, blank=True, null=True)
    longitude = models.CharField(max_length=20, blank=True, null=True)
    def __str__(self):
        return f"{self.tipo_ocorrencia.nome if self.tipo_ocorrencia else 'N/A'} - {self.data_fato.strftime('%d/%m/%Y')}"

class PessoaEnvolvida(models.Model):
    TIPO_ENVOLVIMENTO_CHOICES = [('VITIMA', 'Vítima'), ('TESTEMUNHA', 'Testemunha'), ('SUSPEITO', 'Suspeito'), ('AUTOR', 'Autor'), ('OUTRO', 'Outro')]
    STATUS_CHOICES = [('MORTO', 'Morto'), ('FERIDO', 'Ferido'), ('CAPTURADO', 'Capturado'), ('ILESO', 'Ileso'), ('NAO_APLICAVEL', 'Não Aplicável')]
    DOCUMENTO_CHOICES = [('CPF', 'CPF'), ('RG', 'RG'), ('OUTRO', 'Outro')]
    
    ocorrencia = models.ForeignKey('Ocorrencia', related_name='envolvidos', on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NAO_APLICAVEL', blank=True, null=True)
    tipo_documento = models.CharField(max_length=10, choices=DOCUMENTO_CHOICES, blank=True, null=True)
    
    documento = models.CharField(max_length=50, blank=True, null=True, verbose_name="Número do Documento")
    tipo_envolvimento = models.CharField(max_length=20, choices=TIPO_ENVOLVIMENTO_CHOICES)
    observacoes = models.TextField(blank=True, null=True)
    organizacao_criminosa = models.ForeignKey('OrganizacaoCriminosa', on_delete=models.SET_NULL, null=True, blank=True, related_name='membros')
    
    def __str__(self): return f"{self.nome} ({self.get_tipo_envolvimento_display()})"

class ProcedimentoPenal(models.Model):
    STATUS_CHOICES = [('EM_INVESTIGACAO', 'Em Investigação'), ('EM_ANDAMENTO', 'Em Andamento'), ('CONCLUIDO', 'Concluído'), ('ARQUIVADO', 'Arquivado')]
    pessoa_envolvida = models.ForeignKey('PessoaEnvolvida', related_name='procedimentos', on_delete=models.CASCADE)
    numero_processo = models.CharField(max_length=100, blank=True, null=True)
    vara_tribunal = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EM_INVESTIGACAO')
    detalhes = models.TextField(blank=True, null=True)
    def __str__(self): return f"Processo {self
