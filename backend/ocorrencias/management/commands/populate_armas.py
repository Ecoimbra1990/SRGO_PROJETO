import csv
from django.core.management.base import BaseCommand
from ocorrencias.models import ModeloArma

class Command(BaseCommand):
    help = 'Popula o catálogo de armas a partir de um ficheiro CSV chamado armas.csv'

    def handle(self, *args, **options):
        # O ficheiro CSV deve estar na raiz do projeto backend
        file_path = 'armas.csv'
        self.stdout.write(self.style.NOTICE(f'A ler o ficheiro: {file_path}'))

        try:
            with open(file_path, mode='r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                created_count = 0
                updated_count = 0

                for row in reader:
                    # Usa update_or_create para evitar duplicados e atualizar se já existir
                    obj, created = ModeloArma.objects.update_or_create(
                        modelo=row['modelo'],
                        defaults={
                            'tipo': row.get('tipo', 'FOGO'), # 'FOGO' como padrão
                            'marca': row.get('marca', ''),
                            'calibre': row.get('calibre', ''),
                        }
                    )
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                
                self.stdout.write(self.style.SUCCESS(f'Sincronização completa. Criados: {created_count}, Atualizados: {updated_count}.'))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Erro: O ficheiro "{file_path}" não foi encontrado na raiz do projeto backend.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocorreu um erro inesperado: {e}'))

