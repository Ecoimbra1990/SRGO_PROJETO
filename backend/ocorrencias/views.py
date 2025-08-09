# backend/ocorrencias/views.py

class GerarCadernoPorFiltroPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Obtenha os filtros da requisição
        filtros = request.data.get('filtros', {})
        
        # Filtre as ocorrências
        ocorrencias = Ocorrencia.objects.filter(**filtros).order_by('-data_fato')

        if not ocorrencias.exists():
            return Response({"error": "Nenhuma ocorrência encontrada para os filtros selecionados."}, status=404)

        context = { 'ocorrencias': ocorrencias }
        
        template = get_template('caderno_template.html')
        html = template.render(context)
        
        base_url = request.build_absolute_uri('/')
        
        pdf_file = HTML(string=html, base_url=base_url).write_pdf()
        
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="caderno_informativo_filtrado.pdf"'
        return response
