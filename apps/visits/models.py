from django.utils import timezone
from django.db import models
from apps.clients.models import Client
from apps.programs.models import Program
class Visit(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True)
    visit_date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Visit: {self.client} on {self.visit_date.strftime('%Y-%m-%d')}"
