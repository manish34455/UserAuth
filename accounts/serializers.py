from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
import random
from .models import User, OTP
from django.core.mail import send_mail
from django.conf import settings

def create(self, validated_data):
    user = User.objects.create_user(**validated_data)

    otp_code = str(random.randint(100000, 999999))

    OTP.objects.create(
        user=user,
        otp=otp_code,
        expiration_time=timezone.now() + timedelta(minutes=15)
    )

    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP is {otp_code}. It is valid for 15 minutes.",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return user

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        otp_code = str(random.randint(100000, 999999))

        OTP.objects.create(
            user=user,
            otp=otp_code,
            expiration_time=timezone.now() + timedelta(minutes=15)
        )

        send_mail(
            subject="Your OTP Verification Code",
            message=f"""
Hello,

Your OTP is: {otp_code}

It is valid for 15 minutes.
""",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            otp_obj = OTP.objects.filter(user=user).last()
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email")

        if not otp_obj:
            raise serializers.ValidationError("OTP not found")

        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired")

        if otp_obj.otp != data['otp']:
            raise serializers.ValidationError("Invalid OTP")

        user.verified = True
        user.is_active = True
        user.save()

        otp_obj.delete()

        return data