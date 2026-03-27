"""
URL configuration for VidyaAI_Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    #API endpoint
    path('api/v1/auth/' , include('user_authentication.urls')),
    path('api/v1/chat/' , include('vidyaAI_Bot.urls')),
    path('api/v1/kbmode/',include('vidyaAI_instantKB.urls')),
    path('api/v1/visual/',include('visual_aid.urls')),
    path('api/v1/worksheet/' ,include('worksheets.urls')),
    path('api/v1/planner/' ,include('weaklyPlanner.urls')),
    path('api/v1/assessment/' , include('papercheck.urls'))


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
