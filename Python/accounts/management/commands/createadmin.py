from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = 'admin@gmail.com'
        password = 'Admin@1234'

        user, created = User.objects.get_or_create(email=email)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write('Superuser created!')
        else:
            self.stdout.write('Password reset!')