from django.db import models
from apps.clients.models import Client

class Program(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Enrollment(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    enrolled_on = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('completed', 'Completed'), ('dropped', 'Dropped')])

    class Meta:
        unique_together = ('client', 'program')

    def __str__(self):
        return f"{self.client} → {self.program}"
