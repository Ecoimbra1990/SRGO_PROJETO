# backend/ocorrencias/views.py

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

# Imports para a nova funcionalidade de PDF com WeasyPrint
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.template.loader import get_template
from weasyprint import HTML
from django.conf import settings
from django.contrib.staticfiles.finders import find

# Outros imports para o Dashboard
import pandas as pd
from django.db.models import Count
from django.db.models.functions import TruncMonth

# --- VIEW PARA GERAR O PDF (REESCRITA COM WeasyPrint) ---
class GerarCadernoPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ocorrencia_ids = request.data.get('ocorrencia_ids', [])
        if not ocorrencia_ids:
            return Response({"error": "Nenhuma ocorrência selecionada."}, status=400)

        ocorrencias = Ocorrencia.objects.filter(id__in=ocorrencia_ids).order_by('-data_fato')
        
        context = {
            'ocorrencias': ocorrencias,
        }
        
        template = get_template('caderno_template.html')
        html = template.render(context)
        
        # Constrói a URL base a partir da requisição para que o WeasyPrint encontre os ficheiros estáticos e de média
        base_url = request.build_absolute_uri('/')
        
        pdf_file = HTML(string=html, base_url=base_url).write_pdf()
        
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo.pdf"'
        return response

# --- O resto das ViewSets continua aqui, sem alterações ---
class DashboardAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        queryset = Ocorrencia.objects.all()
        # ... (código do dashboard)
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
