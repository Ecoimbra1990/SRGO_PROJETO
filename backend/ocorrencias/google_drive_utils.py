import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io

# Caminho para o ficheiro de credenciais criado no Render
SERVICE_ACCOUNT_FILE = 'google_credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive']
FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')

def get_drive_service():
    """Autentica e retorna um objeto de serviço do Google Drive."""
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)
    return service

def upload_to_drive(file_object):
    """
    Faz o upload de um ficheiro para a pasta especificada no Google Drive e retorna o link partilhável.
    """
    if not file_object or not FOLDER_ID:
        return None

    try:
        service = get_drive_service()
        
        # Cria um objeto de media a partir do ficheiro em memória
        file_io_base = io.BytesIO(file_object.read())
        media = MediaIoBaseUpload(
            file_io_base, 
            mimetype=file_object.content_type, 
            resumable=True
        )

        # Prepara os metadados do ficheiro
        file_metadata = {
            'name': file_object.name,
            'parents': [FOLDER_ID]
        }

        # Executa o upload e obtém o ID do ficheiro
        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        file_id = uploaded_file.get('id')
        
        # Torna o ficheiro publicamente acessível (qualquer pessoa com o link)
        service.permissions().create(fileId=file_id, body={'role': 'reader', 'type': 'anyone'}).execute()
        
        # Retorna o link para visualização direta
        return uploaded_file.get('webViewLink')

    except Exception as e:
        print(f"Erro ao fazer upload para o Google Drive: {e}")
        return None
