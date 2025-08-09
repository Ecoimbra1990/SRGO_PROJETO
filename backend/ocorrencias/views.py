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
        # ... (lógica de filtro) ...
        ocorrencias_filtradas = queryset.order_by('-data_fato')
        
        if not ocorrencias_filtradas.exists():
            return Response({"error": "Nenhuma ocorrência encontrada."}, status=404)

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
        response['Content-Disposition'] = 'attachment; filename="caderno_filtrado.pdf"'
        return response

# ... (Restante das ViewSets sem alterações)
