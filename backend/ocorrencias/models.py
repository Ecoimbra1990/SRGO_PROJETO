# Importa os módulos necessários do Django
from django.db import models
from django.contrib.auth.models import User

# Modelo para as Organizações Criminosas
class OrganizacaoCriminosa(models.Model):
    nome_organizacao = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=10, default='Ativo')

    def __str__(self):
        return self.nome_organizacao

# Modelo principal para cada Ocorrência
class Ocorrencia(models.Model):
    TIPO_CHOICES = [
        ('Homicidio', 'Homicídio Doloso (CVLI)'),
        ('Resistencia', 'Auto de Resistência'),
        ('Refem', 'Crise com Refém'),
        ('Banco', 'Assalto a Banco'),
        ('Produtividade', 'Ação de Produtividade'),
        ('Social', 'Assunto Social'),
        ('Suplemento', 'Suplemento'),
    ]
    
    tipo_ocorrencia = models.CharField(max_length=50, choices=TIPO_CHOICES)
    data_fato = models.DateTimeField()
    descricao_fato = models.TextField()
    evolucao_ocorrencia = models.TextField(blank=True, null=True)
    endereco_localizacao = models.CharField(max_length=255, blank=True, null=True)
    regiao = models.CharField(max_length=50, blank=True, null=True)
    fonte_informacao = models.CharField(max_length=255, blank=True, null=True)
    caderno_informativo = models.CharField(max_length=50)
    usuario_registro = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_tipo_ocorrencia_display()} - {self.data_fato.strftime('%d/%m/%Y')}"

# Modelo para cada Pessoa envolvida em uma Ocorrência
class PessoaEnvolvida(models.Model):
    TIPO_ENVOLVIMENTO_CHOICES = [
        ('Vitima', 'Vítima (CVLI)'),
        ('Resistente', 'Resistente (Óbito)'),
        ('Autor', 'Autor/Envolvido'),
        ('Refem', 'Refém'),
        ('Testemunha', 'Testemunha'),
    ]
    
    ocorrencia = models.ForeignKey(Ocorrencia, related_name='pessoas_envolvidas', on_delete=models.CASCADE)
    nome_completo = models.CharField(max_length=255)
    vulgo = models.CharField(max_length=100, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)
    filiacao = models.CharField(max_length=255, blank=True, null=True)
    documento_cpf = models.CharField(max_length=11, blank=True, null=True)
    tipo_envolvimento = models.CharField(max_length=50, choices=TIPO_ENVOLVIMENTO_CHOICES)
    situacao_lesao = models.CharField(max_length=50, blank=True, null=True)
    antecedentes_resumo = models.TextField(blank=True, null=True)
    caminho_foto = models.CharField(max_length=255, blank=True, null=True)
    orcrim = models.ForeignKey(OrganizacaoCriminosa, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nome_completo

# Modelo para os Procedimentos Penais de uma Pessoa
class ProcedimentoPenal(models.Model):
    pessoa = models.ForeignKey(PessoaEnvolvida, related_name='procedimentos', on_delete=models.CASCADE)
    numero_procedimento = models.CharField(max_length=100)
    natureza_procedimento = models.CharField(max_length=100, blank=True, null=True)
    unidade_origem = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.numero_procedimento