from django.urls import path
from .views import Visual_aid,SaveDiagram,GetDiagram
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('visual-aid/' , Visual_aid.as_view() , name='visual-aid'),
    path('save-visual-aid/', SaveDiagram.as_view() , name='save-visual-aid'),
    path('get-diagrams/' , GetDiagram.as_view() , name='get-diagrams/')
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
