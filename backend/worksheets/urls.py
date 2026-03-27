from django.urls import path
from .views import Worksheet_generator

urlpatterns = [
    path('worksheet/' , Worksheet_generator.as_view() , name='Worksheet_generator' )
]