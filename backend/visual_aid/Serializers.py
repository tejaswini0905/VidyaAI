from rest_framework import serializers
from .models import VisualAid


class VisualAidSerializer(serializers.ModelSerializer):

    class Meta:
        model = VisualAid,
        fields = ['id', 'question', 'mermaid_code']




