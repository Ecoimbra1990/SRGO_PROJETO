from django.core.management.base import BaseCommand
from django.db import connection, ProgrammingError

class Command(BaseCommand):
    help = 'Drops all tables for the "ocorrencias" app to resolve migration conflicts.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Attempting to drop all tables from the "ocorrencias" app...'))
        
        # Lista de tabelas criadas pela app 'ocorrencias'
        # A ordem é importante para evitar problemas com chaves estrangeiras
        tables = [
            "ocorrencias_procedimentopenal",
            "ocorrencias_pessoaenvolvida",
            "ocorrencias_ocorrencia_envolvidos", # Tabela Many-to-Many se existir
            "ocorrencias_ocorrencia",
            "ocorrencias_tipoocorrencia",
            "ocorrencias_organizacaocriminosa",
        ]

        with connection.cursor() as cursor:
            for table_name in tables:
                try:
                    self.stdout.write(f'Dropping table {table_name}...')
                    # Usamos CASCADE para remover dependências (constraints)
                    cursor.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')
                    self.stdout.write(self.style.SUCCESS(f'Successfully dropped table {table_name}.'))
                except ProgrammingError as e:
                    # Ignora o erro se a tabela não existir
                    self.stdout.write(self.style.NOTICE(f'Table {table_name} does not exist, skipping. Reason: {e}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Could not drop table {table_name}. Reason: {e}'))
        
        self.stdout.write(self.style.SUCCESS('Finished dropping app tables.'))
