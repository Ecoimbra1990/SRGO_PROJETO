# backend/ocorrencias/views.py

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.template.loader import get_template
from weasyprint import HTML, CSS
from django.conf import settings
import os
import pandas as pd
from django.db.models import Count
from django.db.models.functions import TruncMonth

def get_asset_path(asset_name):
    path = os.path.join(settings.STATIC_ROOT, asset_name)
    if os.path.exists(path):
        return f'file://{path}'
    path = os.path.join(settings.BASE_DIR, 'static', asset_name)
    if os.path.exists(path):
        return f'file://{path}'
    return ''

class GerarCadernoPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        ocorrencia_ids = request.data.get('ocorrencia_ids', [])
        if not ocorrencia_ids:
            return Response({"error": "Nenhuma ocorrência selecionada."}, status=400)
        
        ocorrencias = Ocorrencia.objects.filter(id__in=ocorrencia_ids).order_by('-data_fato')
        context = { 
            'ocorrencias': ocorrencias,
            'logo_coppm_path': get_asset_path('assets/coppm.png'),
            'logo_pmba_path': get_asset_path('assets/pmba.png'),
        }
        template = get_template('caderno_template.html')
        html = template.render(context)
        css_path = get_asset_path('css/caderno_style.css').replace('file://', '')
        css = CSS(filename=css_path) if css_path and os.path.exists(css_path) else None
        
        pdf_file = HTML(string=html).write_pdf(stylesheets=[css] if css else [])
        
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo.pdf"'
        return response

class GerarCadernoPorFiltroPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        filtros = request.data.get('filtros', {})
        queryset = Ocorrencia.objects.all()

        if filtros.get('id'):
            queryset = queryset.filter(id=filtros['id'])
        if filtros.get('opm_area'):
            queryset = queryset.filter(opm_area=filtros['opm_area'])
        if filtros.get('bairro'):
            queryset = queryset.filter(bairro__icontains=filtros['bairro'])
        if filtros.get('tipo_ocorrencia'):
            queryset = queryset.filter(tipo_ocorrencia=filtros['tipo_ocorrencia'])
        if filtros.get('ano'):
            queryset = queryset.filter(data_fato__year=filtros['ano'])
        if filtros.get('mes'):
            queryset = queryset.filter(data_fato__month=filtros['mes'])

        ocorrencias_filtradas = queryset.order_by('-data_fato')

        if not ocorrencias_filtradas.exists():
            return Response({"error": "Nenhuma ocorrência encontrada para os filtros aplicados."}, status=404)

        context = { 
            'ocorrencias': ocorrencias_filtradas,
            'logo_coppm_path': get_asset_path('assets/coppm.png'),
            'logo_pmba_path': get_asset_path('assets/pmba.png'),
        }
        template = get_template('caderno_template.html')
        html = template.render(context)
        css_path = get_asset_path('css/caderno_style.css').replace('file://', '')
        css = CSS(filename=css_path) if css_path and os.path.exists(css_path) else None
        
        pdf_file = HTML(string=html).write_pdf(stylesheets=[css] if css else [])
        
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo_filtrado.pdf"'
        return response

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
