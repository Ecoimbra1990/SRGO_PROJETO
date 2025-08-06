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
            credentials_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
            if not credentials_json:
                self.stdout.write(self.style.ERROR('GOOGLE_CREDENTIALS_JSON environment variable not set.'))
                return

            credentials = json.loads(credentials_json)
            gc = gspread.service_account_from_dict(credentials)

            spreadsheet_name = os.environ.get('GOOGLE_SHEET_NAME', 'efetivo.xlsx')
            worksheet_name = os.environ.get('GOOGLE_SHEET_WORKSHEET_NAME', 'efetivo')
            
            self.stdout.write(f'Opening spreadsheet "{spreadsheet_name}" and worksheet "{worksheet_name}"...')
            spreadsheet = gc.open(spreadsheet_name)
            worksheet = spreadsheet.worksheet(worksheet_name)

            records = worksheet.get_all_records()
            
            if not records:
                self.stdout.write(self.style.WARNING('No records found in the spreadsheet.'))
                return

            self.stdout.write(f'Found {len(records)} records. Syncing with database...')
            
            created_count = 0
            updated_count = 0

            for record in records:
                # Usamos update_or_create para evitar duplicados e atualizar dados existentes
                # com base na matrícula, que é única.
                obj, created = Efetivo.objects.update_or_create(
                    matricula=record.get('MATRICULA'),
                    defaults={
                        'nome': record.get('NOME'),
                        'posto_graduacao': record.get('GH'),
                        'unidade': record.get('OPM'),
                        'telefone': record.get('TELEFONE', ''), # Campo opcional
                    }
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Sync complete. Created: {created_count}, Updated: {updated_count}.'))

        except gspread.exceptions.SpreadsheetNotFound:
            self.stdout.write(self.style.ERROR(f'Spreadsheet "{spreadsheet_name}" not found. Please check the name and sharing settings.'))
        except gspread.exceptions.WorksheetNotFound:
            self.stdout.write(self.style.ERROR(f'Worksheet "{worksheet_name}" not found in the spreadsheet.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An unexpected error occurred: {e}'))
