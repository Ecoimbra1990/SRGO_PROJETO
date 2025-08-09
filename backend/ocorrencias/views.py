# backend/ocorrencias/views.py

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib import pagesizes
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import Paragraph, Spacer
import pandas as pd
from django.db.models import Count
from django.db.models.functions import TruncMonth

class GerarCadernoPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ocorrencia_ids = request.data.get('ocorrencia_ids', [])
        if not ocorrencia_ids:
            return Response({"error": "Nenhuma ocorrência selecionada."}, status=400)

        ocorrencias = Ocorrencia.objects.filter(id__in=ocorrencia_ids).order_by('-data_fato')

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=pagesizes.A4)
        width, height = pagesizes.A4
        
        p.setFont("Helvetica-Bold", 16)
        p.drawCentredString(width / 2.0, height - 2*cm, "Caderno Informativo de Ocorrências")
        y_position = height - 4*cm

        for ocorrencia in ocorrencias:
            if y_position < 4 * cm:
                p.showPage()
                y_position = height - 2*cm

            p.setFont("Helvetica-Bold", 12)
            p.drawString(2*cm, y_position, f"Ocorrência Nº {ocorrencia.id} - {ocorrencia.tipo_ocorrencia.nome}")
            y_position -= 1 * cm
            
            p.setFont("Helvetica", 10)
            p.drawString(2*cm, y_position, f"Data: {ocorrencia.data_fato.strftime('%d/%m/%Y %H:%M')}")
            y_position -= 0.7 * cm
            p.drawString(2*cm, y_position, f"Local: {ocorrencia.cidade} / {ocorrencia.bairro}")
            y_position -= 1 * cm

        p.save()
        
        # Obter o valor do buffer APÓS salvar o PDF
        pdf = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo.pdf"'
        return response

# ... (Restante das suas ViewSets - OcorrenciaViewSet, DashboardAnalyticsView, etc.)
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
