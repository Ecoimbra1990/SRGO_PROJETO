# Arquivo: backend/srgo/settings.py

import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1', 't']
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

INSTALLED_APPS = [
    'jazzmin', # Adicione esta linha no topo
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ocorrencias',
    'rest_framework',
    'corsheaders',
]

# --- ATUALIZAÇÃO DO MIDDLEWARE ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Adicione esta linha
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'srgo.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'srgo.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
}

# ... (o resto da configuração de validação de senha e internacionalização permanece o mesmo) ...

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# --- NOVA CONFIGURAÇÃO DO WHITENOISE ---
# Altere esta linha no final do seu ficheiro settings.py
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage" # Removemos 'Manifest'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# --- CONFIGURAÇÕES DO TEMA JAZZMIN ---
JAZZMIN_SETTINGS = {
    # Título da janela do seu site (pode vê-lo na aba do navegador)
    "site_title": "SRGO Admin",

    # Título no cabeçalho do login e do painel
    "site_header": "SRGO COPPM",

    # Logo para o painel de administração (usando o ficheiro que você forneceu)
    "site_logo": "assets/coppm.png", #

    # Texto no rodapé
    "copyright": "Comando de Operações Policiais Militares",

    # Aparência do menu
    "topmenu_links": [
        {"name": "Início", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"model": "auth.User"},
        {"app": "ocorrencias"},
    ],

    # Ícones para as suas aplicações
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "ocorrencias.Ocorrencia": "fas fa-file-alt",
        "ocorrencias.PessoaEnvolvida": "fas fa-user-friends",
        "ocorrencias.OrganizacaoCriminosa": "fas fa-shield-alt",
        "ocorrencias.ProcedimentoPenal": "fas fa-gavel",
    },
}