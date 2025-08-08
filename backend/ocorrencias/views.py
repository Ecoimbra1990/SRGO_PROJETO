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
from reportlab.lib.pagesizes import a4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors

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
        # Caminhos para as logos
        coppm_logo_path = 'backend/static/assets/coppm.png'
        pmba_logo_path = 'backend/static/assets/pmba.png' # Novo caminho
        
        # Logo COPPM (Esquerda)
        try:
            logo_coppm = Image(coppm_logo_path, width=2.5*cm, height=2.5*cm)
            logo_coppm.drawOn(canvas, 1.5*cm, 26*cm)
        except Exception:
            pass # Ignora se a logo não for encontrada

        # Logo PMBA (Direita)
        try:
            logo_pmba = Image(pmba_logo_path, width=2.5*cm, height=2.5*cm)
            logo_pmba.drawOn(canvas, width - 4*cm, 26*cm) # Posição à direita
        except Exception:
            pass # Ignora se a logo não for encontrada

        # Títulos Centrais
        canvas.setFont("Helvetica-Bold", 14)
        canvas.drawCentredString(width / 2.0, 27.5*cm, "GOVERNO DO ESTADO DA BAHIA")
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawCentredString(width / 2.0, 26.8*cm, "POLÍCIA MILITAR DA BAHIA")
        canvas.setFont("Helvetica", 11)
        canvas.drawCentredString(width / 2.0, 26.1*cm, "Comando de Operações Policiais Militares - COPPM")
        
        canvas.line(1.5*cm, 25.8*cm, width - 1.5*cm, 25.8*cm)

    def post(self, request, *args, **kwargs):
        ocorrencia_ids = request.data.get('ocorrencia_ids', [])
