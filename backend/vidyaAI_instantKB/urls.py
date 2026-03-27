from django.urls import path
from .views import KbMode

urlpatterns = [
    path('instantkb/', KbMode.as_view(), name='instantkb')
]