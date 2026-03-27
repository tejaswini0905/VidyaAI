from django.db import models
from django.contrib.auth.models import User

class QuestionPaper(models.Model):
    teacher = models.ForeignKey(User,on_delete = models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='question_papers/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class AnswerSheet(models.Model):
    question_paper = models.ForeignKey(QuestionPaper , on_delete = models.CASCADE , related_name = 'answers')
    student_name = models.CharField(max_length=100)
    grade = models.CharField(max_length=50)
    file = models.FileField(upload_to='answer_sheets/')
    marks_obtained = models.FloatField(null=True, blank=True)
    similarity = models.FloatField(null=True, blank=True)
    extracted_text = models.TextField(null=True, blank=True)
    checked_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_name} - {self.question_paper.title}"