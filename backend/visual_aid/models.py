from django.db import models
from django.contrib.auth.models import User

class VisualAid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='visual-aid/', null=True, blank=True)

    def __str__(self):
        return f"Visual Aid by {self.user.username if self.user else 'Anonymous'}"


