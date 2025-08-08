# backend/ocorrencias/migrations/0009_limpar_dados_homicidio.py

from django.db import migrations

def limpar_dados_antigos(apps, schema_editor):
    """
    Define todos os valores existentes no campo tipo_homicidio como None.
    """
    Ocorrencia = apps.get_model('ocorrencias', 'Ocorrencia')
    # Usamos .all() para garantir que todos os registos sejam atualizados
    Ocorrencia.objects.all().update(tipo_homicidio=None)

class Migration(migrations.Migration):

    dependencies = [
        # O nome aqui deve corresponder ao ficheiro de migração anterior.
        # Verifique na sua pasta de migrações qual é o número correto.
        ('ocorrencias', '0008_modalidadecrime_alter_ocorrencia_tipo_homicidio'),
    ]

    operations = [
        migrations.RunPython(limpar_dados_antigos),
    ]
