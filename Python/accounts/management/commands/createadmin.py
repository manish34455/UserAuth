from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = 'admin@gmail.com'
        password = 'Admin@1234'
        
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write('Superuser created!')
        else:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            self.stdout.write('Password reset done!')