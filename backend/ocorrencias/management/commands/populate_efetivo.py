import os
import json
import gspread
from django.core.management.base import BaseCommand
from django.conf import settings
from ocorrencias.models import Efetivo

class Command(BaseCommand):
    help = 'Populates the Efetivo table from a Google Sheet.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting to populate Efetivo table...'))

        try:
            # Carregar credenciais a partir da variável de ambiente
            credentials_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
            if not credentials_json:
                self.stdout.write(self.style.ERROR('GOOGLE_CREDENTIALS_JSON environment variable not set.'))
                return

            credentials = json.loads(credentials_json)
            gc = gspread.service_account_from_dict(credentials)

            # Nome da sua planilha e da folha de cálculo
            # Certifique-se de que estes nomes correspondem exatamente aos seus
            spreadsheet_name = os.environ.get('GOOGLE_SHEET_NAME', 'SRGO_DADOS')
            worksheet_name = os.environ.get('GOOGLE_SHEET_WORKSHEET_NAME', 'Efetivo')
            
            self.stdout.write(f'Opening spreadsheet "{spreadsheet_name}" and worksheet "{worksheet_name}"...')
            spreadsheet = gc.open(spreadsheet_name)
            worksheet = spreadsheet.worksheet(worksheet_name)

            # Obter todos os dados (exceto o cabeçalho)
            records = worksheet.get_all_records()
            
            if not records:
                self.stdout.write(self.style.WARNING('No records found in the spreadsheet.'))
                return

            self.stdout.write(f'Found {len(records)} records. Syncing with database...')
            
            # Limpa a tabela antes de popular para evitar duplicados
            Efetivo.objects.all().delete()

            for record in records:
                # Verifique se os nomes das colunas na sua planilha são estes:
                # 'Nome de Guerra', 'Matrícula', 'Posto/Grad.', 'Unidade'
                Efetivo.objects.create(
                    nome_guerra=record.get('Nome de Guerra'),
                    matricula=record.get('Matrícula'),
                    posto_graduacao=record.get('Posto/Grad.'),
                    unidade=record.get('Unidade')
                )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully populated {len(records)} records into Efetivo table.'))

        except gspread.exceptions.SpreadsheetNotFound:
            self.stdout.write(self.style.ERROR(f'Spreadsheet "{spreadsheet_name}" not found. Please check the name and sharing settings.'))
        except gspread.exceptions.WorksheetNotFound:
            self.stdout.write(self.style.ERROR(f'Worksheet "{worksheet_name}" not found in the spreadsheet.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An unexpected error occurred: {e}'))
