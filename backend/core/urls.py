from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views, auth_views

router = DefaultRouter()
router.register(r'boards', views.BoardViewSet)
router.register(r'lists', views.ListViewSet)
router.register(r'cards', views.CardViewSet)
router.register(r'comments', views.CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', auth_views.RegisterView.as_view({'post': 'register'}), name='register'),
    path('user/me/', auth_views.UserViewSet.as_view({'get': 'me'}), name='user_me'),
]
