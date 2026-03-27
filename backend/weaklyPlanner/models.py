# models.py
from django.db import models
from django.contrib.auth.models import User


class WeeklyPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    grade = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


class Subject(models.Model):
    weekly_plan = models.ForeignKey(WeeklyPlan, related_name='subjects', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    chapter = models.CharField(max_length=200)
    color = models.CharField(max_length=7, default='#FFE5B4')
    icon = models.CharField(max_length=10, default='📚')


class DailyPlan(models.Model):
    weekly_plan = models.ForeignKey(WeeklyPlan, related_name='daily_plans', on_delete=models.CASCADE)
    day = models.CharField(max_length=20)  # monday, tuesday, etc.

    class Meta:
        ordering = ['day']


class SubjectSchedule(models.Model):
    daily_plan = models.ForeignKey(DailyPlan, related_name='subjects', on_delete=models.CASCADE)
    subject_name = models.CharField(max_length=100)
    topics = models.JSONField()  # List of topics
    coverage = models.CharField(max_length=10)