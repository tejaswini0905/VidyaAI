from django.urls import path
from .views import WeaklyPlanner

urlpatterns = [
    path('planner/' , WeaklyPlanner.as_view() , name='WeaklyPlanner' )
]