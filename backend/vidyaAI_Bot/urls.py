from django.urls import path,include
from .views import Chatbot

urlpatterns = [
    #API endpoint
    path('chatbot/' , Chatbot.as_view() ,name='chatbot'),
]
