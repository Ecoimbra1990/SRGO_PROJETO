from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from io import BytesIO
from django.template.loader import get_template
from weasyprint import HTML
from django.conf import settings

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
        
        context = { 'ocorrencias': ocorrencias }
        
        template = get_template('caderno_template.html')
        html = template.render(context)
        
        base_url = request.build_absolute_uri('/')
        
        pdf_file = HTML(string=html, base_url=base_url).write_pdf()
        
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo.pdf"'
        return response

# ... (Restante das ViewSets - sem alterações)
# ...
