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
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors
import pandas as pd
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.contrib.staticfiles.finders import find

# --- VIEW PRINCIPAL PARA GERAR O PDF (REESCRITA COM SimpleDocTemplate) ---
class GerarCadernoPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Função para o cabeçalho em cada página
    def header(self, canvas, doc):
        canvas.saveState()
        width, height = doc.pagesize
        
        coppm_logo_path = find('assets/coppm.png')
        pmba_logo_path = find('assets/pmba.png')

        if coppm_logo_path:
            canvas.drawImage(coppm_logo_path, 1.5*cm, height - 3*cm, width=2.5*cm, height=2.5*cm, preserveAspectRatio=True, mask='auto')
        
        if pmba_logo_path:
            canvas.drawImage(pmba_logo_path, width - 4*cm, height - 3*cm, width=2.5*cm, height=2.5*cm, preserveAspectRatio=True, mask='auto')

        canvas.setFont("Helvetica-Bold", 14)
        canvas.drawCentredString(width / 2.0, height - 1.5*cm, "GOVERNO DO ESTADO DA BAHIA")
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawCentredString(width / 2.0, height - 2.2*cm, "POLÍCIA MILITAR DA BAHIA")
        canvas.setFont("Helvetica", 11)
        canvas.drawCentredString(width / 2.0, height - 2.9*cm, "Comando de Operações Policiais Militares - COPPM")
        
        canvas.line(1.5*cm, height - 3.2*cm, width - 1.5*cm, height - 3.2*cm)
        canvas.restoreState()

    # Função para o rodapé em cada página
    def footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.drawRightString(20*cm, 1.5*cm, f"Página {doc.page}")
        canvas.restoreState()

    def post(self, request, *args, **kwargs):
        ocorrencia_ids = request.data.get('ocorrencia_ids', [])
        if not ocorrencia_ids:
            return Response({"error": "Nenhuma ocorrência selecionada."}, status=400)

        ocorrencias = Ocorrencia.objects.filter(id__in=ocorrencia_ids).order_by('-data_fato')

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=4*cm, bottomMargin=2.5*cm, leftMargin=1.5*cm, rightMargin=1.5*cm)
        
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY, fontSize=10, leading=14))
        styles.add(ParagraphStyle(name='H1', fontSize=16, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=20))
        styles.add(ParagraphStyle(name='H2', fontSize=11, fontName='Helvetica-Bold', spaceBefore=12, spaceAfter=6, textColor=colors.darkblue))
        styles.add(ParagraphStyle(name='TableHeader', fontSize=9, fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle(name='TableBody', fontSize=9, fontName='Helvetica'))
        
        story = [Paragraph("CADERNO INFORMATIVO DE OCORRÊNCIAS", styles['H1'])]

        for ocorrencia in ocorrencias:
            story.append(Spacer(1, 1*cm))
            
            tipo_ocorrencia_str = ocorrencia.tipo_ocorrencia.nome.upper() if ocorrencia.tipo_ocorrencia else "NÃO ESPECIFICADO"
            story.append(Paragraph(f"OCORRÊNCIA Nº {ocorrencia.id} - {tipo_ocorrencia_str}", styles['H2']))

            data = [
                [Paragraph('<b>Data/Hora do Fato:</b>', styles['TableHeader']), Paragraph(ocorrencia.data_fato.strftime('%d/%m/%Y %H:%M'), styles['TableBody'])],
                [Paragraph('<b>Local:</b>', styles['TableHeader']), Paragraph(f"{ocorrencia.cidade or ''} / {ocorrencia.bairro or ''}", styles['TableBody'])],
                [Paragraph('<b>RISP / AISP / OPM:</b>', styles['TableHeader']), Paragraph(f"{ocorrencia.risp_area.nome if ocorrencia.risp_area else ''} / {ocorrencia.aisp_area.nome if ocorrencia.aisp_area else ''} / {ocorrencia.opm_area.nome if ocorrencia.opm_area else ''}", styles['TableBody'])],
            ]
            table = Table(data, colWidths=[4*cm, 13.5*cm])
            story.append(table)
            story.append(Spacer(1, 0.4*cm))
            
            story.append(Paragraph("<b>DESCRIÇÃO DO FATO:</b>", styles['TableHeader']))
            story.append(Paragraph(ocorrencia.descricao_fato.replace('\n', '<br/>'), styles['Justify']))

        doc.build(story, onFirstPage=self.header, onLaterPages=self.header, canvasmaker=PageNumCanvas)
        
        pdf = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(pdf, content_type='application/pdf')
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
