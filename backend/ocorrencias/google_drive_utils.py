import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io

SERVICE_ACCOUNT_FILE = 'google_credentials.json'
SCOPES = ['https://www.googleapis.com/auth/drive']
FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')

def get_drive_service():
    """Autentica e retorna um objeto de serviço do Google Drive."""
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"Erro: Ficheiro de credenciais '{SERVICE_ACCOUNT_FILE}' não encontrado.")
        return None
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
        if not service:
            return None
        
        file_io_base = io.BytesIO(file_object.read())
        media = MediaIoBaseUpload(
            file_io_base, 
            mimetype=file_object.content_type, 
            resumable=True
        )

        file_metadata = {
            'name': file_object.name,
            'parents': [FOLDER_ID]
        }

        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        file_id = uploaded_file.get('id')
        service.permissions().create(fileId=file_id, body={'role': 'reader', 'type': 'anyone'}).execute()
        
        # Transforma o link de visualização num link direto para a imagem
        return uploaded_file.get('webViewLink').replace("view", "uc")

    except Exception as e:
        print(f"Erro ao fazer upload para o Google Drive: {e}")
        return None
