from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, VerifyOTPSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.exceptions import TokenError
from .permissions import IsSuperAdmin
from .models import User

class SuperAdminDashboard(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        return Response({
            "message": "Welcome SuperAdmin",
            "email": request.user.email
        })
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "No refresh token"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)

            # ✅ Correctly get user from token payload
            user_id = refresh['user_id']
            user = User.objects.get(id=user_id)

            # Blacklist old refresh token and issue new one (rotation)
            refresh.blacklist()
            new_refresh = RefreshToken.for_user(user)
            new_access = new_refresh.access_token

            response = Response({"message": "Token refreshed"})

            response.set_cookie(
                key='access_token',
                value=str(new_access),
                httponly=True,
                secure=False,
                samesite='Lax'
            )

            response.set_cookie(
                key='refresh_token',
                value=str(new_refresh),
                httponly=True,
                secure=False,
                samesite='Lax'
            )

            return response

        except (TokenError, User.DoesNotExist):
            return Response({"error": "Invalid refresh token"}, status=401)


# ---------------- Profile (Protected) ----------------
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "email": request.user.email,
            "role": request.user.role
        })


# ---------------- Register (Public) ----------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("🔥 REGISTER API HIT")
        print("🔥 REQUEST DATA:", request.data)

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            print("🔥 SERIALIZER VALID")
            serializer.save()
            return Response({"message": "User registered. Check OTP."}, status=201)

        print("🔥 SERIALIZER ERRORS:", serializer.errors)
        return Response(serializer.errors, status=400)


# ---------------- Verify OTP (Public) ----------------
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]   # ✅ ADD THIS

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)

        if serializer.is_valid():
            return Response({"message": "Email verified successfully"}, status=200)

        return Response(serializer.errors, status=400)


# ---------------- Login (Public) ----------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        user = authenticate(email=email, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=400)

        if not user.verified:
            return Response({"error": "Email not verified. Please check your inbox for the OTP."}, status=403)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        response = Response({
            "message": "Login successful",
            "user": {"email": user.email, "role": user.role}
        })

        response.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            secure=False,  # Set to True in production (HTTPS)
            samesite='Lax'
        )

        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax'
        )

        return response


# ---------------- Logout (Protected Optional) ----------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]   # Optional but better

    def post(self, request):
        response = Response({"message": "Logged out"})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response