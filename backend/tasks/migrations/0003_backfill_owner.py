from django.conf import settings
from django.db import migrations


def backfill_owner(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    User = apps.get_model(settings.AUTH_USER_MODEL)
    default_owner = User.objects.order_by('id').first()
    if default_owner is not None:
        Task.objects.filter(owner__isnull=True).update(owner=default_owner)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0002_task_owner'),
    ]

    operations = [
        migrations.RunPython(backfill_owner, noop),
    ]
