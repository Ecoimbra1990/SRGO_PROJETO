from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Futuramente, aqui incluiremos as URLs da nossa API.
    # Ex: path('api/', include('ocorrencias.urls')),
]