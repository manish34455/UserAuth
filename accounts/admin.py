from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'role', 'verified', 'is_active')
    ordering = ('email',)
    search_fields = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('role', 'verified', 'is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(OTP)