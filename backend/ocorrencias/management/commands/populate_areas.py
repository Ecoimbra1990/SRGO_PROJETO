# backend/ocorrencias/management/commands/populate_areas.py

import csv
from django.core.management.base import BaseCommand
from ocorrencias.models import RISP, AISP, OPM, Localidade

class Command(BaseCommand):
    help = 'Popula as tabelas RISP, AISP, OPM e Localidade a partir de um ficheiro CSV.'

    def handle(self, *args, **options):
        # O ficheiro CSV deve estar na raiz do projeto backend
        file_path = 'dimensionamento.csv'
        self.stdout.write(self.style.NOTICE(f'A ler o ficheiro: {file_path}'))

        # Caches para evitar buscas repetidas ao banco
        risp_cache = {}
        aisp_cache = {}
        opm_cache = {}

        try:
            with open(file_path, mode='r', encoding='utf-8') as csvfile:
                # Usamos DictReader para aceder às colunas pelo nome
                reader = csv.DictReader(csvfile, delimiter=';')

                created_counts = {'risp': 0, 'aisp': 0, 'opm': 0, 'localidade': 0}
                updated_counts = {'risp': 0, 'aisp': 0, 'opm': 0, 'localidade': 0}

                for row in reader:
                    # Limpa espaços em branco dos nomes das colunas e valores
                    row = {key.strip(): value.strip() for key, value in row.items()}

                    risp_nome = row.get('RISP')
                    aisp_nome = row.get('AISP')
                    opm_nome = row.get('OPM')
                    municipio_bairro = row.get('MUNICIPIO/BAIRRO')
                    coorpin = row.get('COORPIN')

                    if not all([risp_nome, aisp_nome, opm_nome, municipio_bairro]):
                        self.stdout.write(self.style.WARNING(f'Linha ignorada por conter dados em falta: {row}'))
                        continue

                    # 1. Garante a existência da RISP
                    if risp_nome not in risp_cache:
                        risp_obj, created = RISP.objects.update_or_create(
                            nome=risp_nome,
                            defaults={'coordenadoria': coorpin}
                        )
                        risp_cache[risp_nome] = risp_obj
                        if created: created_counts['risp'] += 1
                        else: updated_counts['risp'] += 1
                    risp_obj = risp_cache[risp_nome]

                    # 2. Garante a existência da AISP
                    if aisp_nome not in aisp_cache:
                        aisp_obj, created = AISP.objects.update_or_create(
                            nome=aisp_nome,
                            defaults={'risp': risp_obj}
                        )
                        aisp_cache[aisp_nome] = aisp_obj
                        if created: created_counts['aisp'] += 1
                        else: updated_counts['aisp'] += 1
                    aisp_obj = aisp_cache[aisp_nome]

                    # 3. Garante a existência da OPM e associa-a à AISP
                    if opm_nome not in opm_cache:
                        opm_obj, created = OPM.objects.update_or_create(
                            nome=opm_nome,
                            defaults={'aisp': aisp_obj}
                        )
                        opm_cache[opm_nome] = opm_obj
                        if created: created_counts['opm'] += 1
                        else: updated_counts['opm'] += 1
                    opm_obj = opm_cache[opm_nome]

                    # 4. Cria ou atualiza a Localidade
                    _, created = Localidade.objects.update_or_create(
                        municipio_bairro=municipio_bairro,
                        defaults={'opm': opm_obj}
                    )
                    if created: created_counts['localidade'] += 1
                    else: updated_counts['localidade'] += 1

                self.stdout.write(self.style.SUCCESS('Sincronização completa!'))
                self.stdout.write(f"RISPs: {created_counts['risp']} criadas, {updated_counts['risp']} atualizadas.")
                self.stdout.write(f"AISPs: {created_counts['aisp']} criadas, {updated_counts['aisp']} atualizadas.")
                self.stdout.write(f"OPMs: {created_counts['opm']} criadas, {updated_counts['opm']} atualizadas.")
                self.stdout.write(f"Localidades: {created_counts['localidade']} criadas, {updated_counts['localidade']} atualizadas.")

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Erro: O ficheiro "{file_path}" não foi encontrado na raiz do projeto backend.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocorreu um erro inesperado: {e}'))
