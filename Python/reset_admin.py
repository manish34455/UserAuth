import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if User.objects.filter(username='admin').exists():
    user = User.objects.get(username='admin')
    user.set_password('Admin@1234')
    user.save()
    print("Password reset successful!")
else:
    User.objects.create_superuser('admin', 'admin@gmail.com', 'Admin@1234')
    print("Superuser created!")