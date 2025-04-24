from django.db import models
from django.contrib.auth import get_user_model

class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    performed_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.timestamp}: {self.action}"
