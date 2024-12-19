# Generated by Django 5.1.4 on 2024-12-19 01:42

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='is_online',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='last_activity',
            field=models.DateField(default=datetime.datetime(2024, 12, 19, 1, 42, 3, 396162, tzinfo=datetime.timezone.utc)),
        ),
    ]
