from django.urls import path
from .views import RegisterView, VerifyOTPView, LoginView, LogoutView
from .views import ProfileView
from .views import RefreshTokenView
from .views import SuperAdminDashboard


urlpatterns = [
    path('superadmin/', SuperAdminDashboard.as_view()),
    path('refresh/', RefreshTokenView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('register/', RegisterView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
]