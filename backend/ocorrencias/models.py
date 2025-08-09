from django.db import models
from django.contrib.auth.models import User

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
    def __str__(self): return f"{self.posto_graduacao} {self.nome} - {self.matricula}"

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

class ModalidadeCrime(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Modalidade")
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

class Ocorrencia(models.Model):
    tipo_ocorrencia = models.ForeignKey('TipoOcorrencia', on_delete=models.SET_NULL, null=True)
    tipo_homicidio = models.ForeignKey('ModalidadeCrime', on_delete=models.SET_NULL, blank=True, null=True, verbose_name="Tipo do Crime")
    caderno_informativo = models.ForeignKey('CadernoInformativo', on_delete=models.SET_NULL, null=True, blank=True)
    opm_area = models.ForeignKey('OPM', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="OPM da Área")
    aisp_area = models.ForeignKey('AISP', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="AISP da Área")
    risp_area = models.ForeignKey('RISP', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="RISP da Área")
    # ALTERADO: De ImageField para URLField
    foto_ocorrencia = models.URLField(max_length=1024, blank=True, null=True, verbose_name="Foto da Ocorrência")
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
    def __str__(self): return f"{self.tipo_ocorrencia.nome if self.tipo_ocorrencia else 'N/A'} - {self.data_fato.strftime('%d/%m/%Y')}"
    def save(self, *args, **kwargs):
        self.aisp_area = None
        self.risp_area = None
        if self.opm_area and self.opm_area.aisp:
            self.aisp_area = self.opm_area.aisp
            if self.opm_area.aisp.risp:
                self.risp_area = self.opm_area.aisp.risp
        super().save(*args, **kwargs)

class PessoaEnvolvida(models.Model):
    TIPO_ENVOLVIMENTO_CHOICES = [('VITIMA', 'Vítima'), ('TESTEMUNHA', 'Testemunha'), ('SUSPEITO', 'Suspeito'), ('AUTOR', 'Autor'), ('OUTRO', 'Outro')]
    STATUS_CHOICES = [('MORTO', 'Morto'), ('FERIDO', 'Ferido'), ('CAPTURADO', 'Capturado'), ('ILESO', 'Ileso'), ('NAO_APLICAVEL', 'Não Aplicável')]
    DOCUMENTO_CHOICES = [('CPF', 'CPF'), ('RG', 'RG'), ('OUTRO', 'Outro')]
    SEXO_CHOICES = [('M', 'Masculino'), ('F', 'Feminino'), ('I', 'Indefinido')]
    ocorrencia = models.ForeignKey('Ocorrencia', related_name='envolvidos', on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, default='I', blank=True, null=True)
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
    def __str__(self): return f"Processo {self.numero_processo or 'N/A'}"

class ModeloArma(models.Model):
    TIPO_CHOICES = [('FOGO', 'Arma de Fogo'), ('BRANCA', 'Arma Branca'), ('SIMULACRO', 'Simulacro'), ('ARTESANAL', 'Artesanal'), ('OUTRO', 'Outro')]
    ESPECIE_CHOICES = [
        ('PISTOLA', 'Pistola'), ('REVOLVER', 'Revólver'), ('FUZIL', 'Fuzil'),
        ('ESPINGARDA', 'Espingarda'), ('METRALHADORA', 'Metralhadora'),
        ('SUBMETRALHADORA', 'Submetralhadora'), ('GRANADA', 'Granada'),
        ('EXPLOSIVO', 'Outros Explosivos'), ('NAO_DEFINIDA', 'Não Definida'),
    ]
    modelo = models.CharField(max_length=100, unique=True, help_text="Ex: Taurus G2C, IMBEL MD2")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='FOGO')
    especie = models.CharField(max_length=20, choices=ESPECIE_CHOICES, default='NAO_DEFINIDA', verbose_name="Espécie da Arma")
    marca = models.CharField(max_length=100, blank=True, help_text="Ex: Taurus, Glock, IMBEL")
    calibre = models.CharField(max_length=50, blank=True, help_text="Ex: 9mm, .40, .380")
    def __str__(self): return self.modelo

class ArmaApreendida(models.Model):
    ocorrencia = models.ForeignKey('Ocorrencia', related_name='armas_apreendidas', on_delete=models.CASCADE)
    modelo_catalogado = models.ForeignKey('ModeloArma', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Modelo (do Catálogo)")
    tipo = models.CharField(max_length=100, help_text="Ex: Arma de Fogo, Arma Branca...")
    marca = models.CharField(max_length=100, blank=True)
    modelo = models.CharField(max_length=100)
    calibre = models.CharField(max_length=50, blank=True)
    numero_serie = models.CharField(max_length=100, blank=True, verbose_name="Número de Série")
    observacoes = models.TextField(blank=True)
    def __str__(self): return f"{self.modelo} ({self.numero_serie or 'S/N'}) - Ocorrência {self.ocorrencia.id}"
