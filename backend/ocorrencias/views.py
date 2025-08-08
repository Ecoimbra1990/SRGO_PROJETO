# backend/ocorrencias/views.py

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

# Imports para a nova funcionalidade de PDF
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from io import BytesIO
from reportlab.pdfgen import canvas
# --- IMPORTAÇÃO CORRIGIDA ---
from reportlab.lib import pagesizes
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors
import pandas as pd
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.contrib.staticfiles.finders import find

# --- HELPER PARA O CABEÇALHO E RODAPÉ DO PDF ---
class PageNumCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.setFont("Helvetica", 9)
        self.drawRightString(20*cm, 1.5*cm, f"Página {self._pageNumber} de {page_count}")

# --- VIEW PRINCIPAL PARA GERAR O PDF ---
class GerarCadernoPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def draw_header(self, canvas, width):
        coppm_logo_path = find('assets/coppm.png')
        pmba_logo_path = find('assets/pmba.png')
        
        if coppm_logo_path:
            logo_coppm = Image(coppm_logo_path, width=2.5*cm, height=2.5*cm)
            logo_coppm.drawOn(canvas, 1.5*cm, 26*cm)

        if pmba_logo_path:
            logo_pmba = Image(pmba_logo_path, width=2.5*cm, height=2.5*cm)
            logo_pmba.drawOn(canvas, width - 4*cm, 26*cm)

        canvas.setFont("Helvetica-Bold", 14)
        canvas.drawCentredString(width / 2.0, 27.5*cm, "GOVERNO DO ESTADO DA BAHIA")
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawCentredString(width / 2.0, 26.8*cm, "POLÍCIA MILITAR DA BAHIA")
        canvas.setFont("Helvetica", 11)
        canvas.drawCentredString(width / 2.0, 26.1*cm, "Comando de Operações Policiais Militares - COPPM")
        canvas.line(1.5*cm, 25.8*cm, width - 1.5*cm, 25.8*cm)

    def post(self, request, *args, **kwargs):
        ocorrencia_ids = request.data.get('ocorrencia_ids', [])
        if not ocorrencia_ids:
            return Response({"error": "Nenhuma ocorrência selecionada."}, status=400)

        ocorrencias = Ocorrencia.objects.filter(id__in=ocorrencia_ids).order_by('-data_fato')

        buffer = BytesIO()
        # --- USO CORRIGIDO DE PAGESIZES.A4 (MAIÚSCULO) ---
        p = PageNumCanvas(buffer, pagesize=pagesizes.A4)
        width, height = pagesizes.A4
        
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY, fontSize=10, leading=14))
        styles.add(ParagraphStyle(name='H1', fontSize=14, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=10))
        styles.add(ParagraphStyle(name='H2', fontSize=11, fontName='Helvetica-Bold', spaceBefore=8, spaceAfter=4))
        styles.add(ParagraphStyle(name='TableHeader', fontSize=9, fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle(name='TableBody', fontSize=9, fontName='Helvetica'))
        
        y_position = height - 4.5*cm

        for i, ocorrencia in enumerate(ocorrencias):
            story = []
            tipo_ocorrencia_str = ocorrencia.tipo_ocorrencia.nome.upper() if ocorrencia.tipo_ocorrencia else "NÃO ESPECIFICADO"
            story.append(Paragraph(f"<b>OCORRÊNCIA Nº {ocorrencia.id} - {tipo_ocorrencia_str}</b>", styles['H2']))
            data = [
                [Paragraph('<b>Data/Hora do Fato:</b>', styles['TableHeader']), Paragraph(ocorrencia.data_fato.strftime('%d/%m/%Y %H:%M'), styles['TableBody'])],
                [Paragraph('<b>Local:</b>', styles['TableHeader']), Paragraph(f"{ocorrencia.cidade} / {ocorrencia.bairro}", styles['TableBody'])],
                [Paragraph('<b>RISP / AISP / OPM:</b>', styles['TableHeader']), Paragraph(f"{ocorrencia.risp_area.nome if ocorrencia.risp_area else ''} / {ocorrencia.aisp_area.nome if ocorrencia.aisp_area else ''} / {ocorrencia.opm_area.nome if ocorrencia.opm_area else ''}", styles['TableBody'])],
            ]
            table = Table(data, colWidths=[4*cm, 14*cm])
            story.append(table)
            story.append(Spacer(1, 0.4*cm))
            story.append(Paragraph("<b>DESCRIÇÃO DO FATO:</b>", styles['TableHeader']))
            story.append(Paragraph(ocorrencia.descricao_fato.replace('\n', '<br/>'), styles['Justify']))
            total_height = sum([s.wrapOn(p, width - 3*cm, height)[1] for s in story]) + 2*cm
            
            if y_position - total_height < 3*cm:
                self.draw_header(p, width)
                p.showPage()
                y_position = height - 4.5*cm
            if i == 0:
                p.setFont("Helvetica-Bold", 16)
                p.drawCentredString(width / 2.0, 25*cm, "CADERNO INFORMATIVO DE OCORRÊNCIAS")

            self.draw_header(p, width)
            for item in story:
                h = item.wrapOn(p, width - 3*cm, height)[1]
                item.drawOn(p, 1.5*cm, y_position - h)
                y_position -= h
            y_position -= 1.5*cm
            p.line(1.5*cm, y_position + 0.7*cm, width - 1.5*cm, y_position + 0.7*cm)

        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo.pdf"'
        return response

# --- O resto das ViewSets continua aqui, sem alterações ---
class DashboardAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        queryset = Ocorrencia.objects.all()
        heatmap_data = list(queryset.exclude(latitude__isnull=True, longitude__isnull=True).values('latitude', 'longitude'))
        ocorrencias_por_mes = queryset.annotate(month=TruncMonth('data_fato')).values('month').annotate(count=Count('id')).order_by('month')
        top_tipos = list(queryset.values('tipo_ocorrencia__nome').annotate(count=Count('id')).order_by('-count')[:5])
        top_bairros = list(queryset.values('bairro').annotate(count=Count('id')).order_by('-count')[:5])
        data = {
            'heatmap_data': heatmap_data,
            'ocorrencias_por_mes': list(ocorrencias_por_mes),
            'top_tipos_ocorrencia': top_tipos,
            'top_bairros': top_bairros,
        }
        return Response(data)

class ModalidadeCrimeViewSet(viewsets.ModelViewSet):
    queryset = ModalidadeCrime.objects.all().order_by('nome')
    serializer_class = ModalidadeCrimeSerializer
    permission_classes = [permissions.IsAuthenticated]

class OcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = Ocorrencia.objects.all().order_by('-data_criacao')
    serializer_class = OcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = { 'id': ['exact'], 'opm_area': ['exact'], 'tipo_ocorrencia': ['exact'], 'data_fato': ['year', 'month'], }
    search_fields = ['bairro', 'descricao_fato']
    ordering_fields = ['data_fato', 'id']
    def perform_create(self, serializer):
        serializer.save(usuario_registro=self.request.user)

class OrganizacaoCriminosaViewSet(viewsets.ModelViewSet):
    queryset = OrganizacaoCriminosa.objects.all().order_by('nome')
    serializer_class = OrganizacaoCriminosaSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoOcorrenciaViewSet(viewsets.ModelViewSet):
    queryset = TipoOcorrencia.objects.all().order_by('nome')
    serializer_class = TipoOcorrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

class CadernoInformativoViewSet(viewsets.ModelViewSet):
    queryset = CadernoInformativo.objects.all().order_by('nome')
    serializer_class = CadernoInformativoSerializer
    permission_classes = [permissions.IsAuthenticated]

class OPMViewSet(viewsets.ModelViewSet):
    queryset = OPM.objects.all().order_by('nome')
    serializer_class = OPMSerializer
    permission_classes = [permissions.IsAuthenticated]

class ModeloArmaViewSet(viewsets.ModelViewSet):
    queryset = ModeloArma.objects.all().order_by('modelo')
    serializer_class = ModeloArmaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['modelo', 'marca', 'calibre']

class LocalidadeViewSet(viewsets.ModelViewSet):
    queryset = Localidade.objects.all()
    serializer_class = LocalidadeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['municipio_bairro']
