from django.contrib.auth.models import User
from django.db import models
from django.contrib.postgres.fields import ArrayField

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)
    lang = models.TextField()
    education = models.CharField(max_length=30)
    age = models.IntegerField()
    grades = models.JSONField(default=list, blank=True)
    school = models.CharField(max_length=500 , default="Not Provided")


    def __str__(self):
        return self.user.username
