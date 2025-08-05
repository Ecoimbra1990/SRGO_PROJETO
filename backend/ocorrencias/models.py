from django.db import models
from django.contrib.auth.models import User

class OrganizacaoCriminosa(models.Model):
    nome = models.CharField(max_length=255, unique=True)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

class TipoOcorrencia(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

class Ocorrencia(models.Model):
    tipo_ocorrencia = models.ForeignKey(TipoOcorrencia, on_delete=models.SET_NULL, null=True)
    data_fato = models.DateTimeField()
    descricao_fato = models.TextField()
    fonte_informacao = models.CharField(max_length=200)
    caderno_informativo = models.CharField(max_length=50)
    evolucao_ocorrencia = models.TextField()
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
    ocorrencia = models.ForeignKey(Ocorrencia, related_name='envolvidos', on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    documento = models.CharField(max_length=50, blank=True, null=True)
    tipo_envolvimento = models.CharField(max_length=20, choices=TIPO_ENVOLVIMENTO_CHOICES)
    observacoes = models.TextField(blank=True, null=True)
    organizacao_criminosa = models.ForeignKey(OrganizacaoCriminosa, on_delete=models.SET_NULL, null=True, blank=True, related_name='membros')
    def __str__(self): return f"{self.nome} ({self.get_tipo_envolvimento_display()})"

class ProcedimentoPenal(models.Model):
    STATUS_CHOICES = [('EM_INVESTIGACAO', 'Em Investigação'), ('EM_ANDAMENTO', 'Em Andamento'), ('CONCLUIDO', 'Concluído'), ('ARQUIVADO', 'Arquivado')]
    pessoa_envolvida = models.ForeignKey(PessoaEnvolvida, related_name='procedimentos', on_delete=models.CASCADE)
    numero_processo = models.CharField(max_length=100, unique=True, blank=True, null=True)
    vara_tribunal = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EM_INVESTIGACAO')
    detalhes = models.TextField(blank=True, null=True)
    def __str__(self): return f"Processo {self.numero_processo} ({self.get_status_display()})"
