# Arquivo: backend/ocorrencias/views.py

from django.http import JsonResponse

def test_api_view(request):
    """
    Uma view de teste simples para confirmar que a API está funcionando.
    """
    data = {
        'status': 'sucesso',
        'message': 'API do SRGO está no ar e funcionando!'
    }
    return JsonResponse(data)