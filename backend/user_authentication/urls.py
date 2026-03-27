from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static


from . import views
from .views import SignUp,Login ,ProFile

#authentication API Endpoints

urlpatterns = [

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #custome endpoints

    path('signup/' , SignUp.as_view() , name='signup'),
    path('login/' , Login.as_view() , name='login'),

    #profile api endpoint

    path('profile/<int:id>/' ,ProFile.as_view() , name='profile')

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)