from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OcorrenciaViewSet, UserCreate

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'ocorrencias', OcorrenciaViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserCreate.as_view(), name='user_create'),
]
