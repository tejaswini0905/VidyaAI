from django.urls import path,include
from django.conf.urls.static import static
from django.conf import settings
from .views import questionPaper,UploadAndCheck,GetPaperHistory

urlpatterns = [
    path('upload-paper/' , questionPaper.as_view() , name='upload-paper'),
    path('check-paper/' , UploadAndCheck.as_view() , name='check-paper'),
    path('get-paper/' , GetPaperHistory.as_view() , name ='get-paper')

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)