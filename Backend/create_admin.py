"""
Script pour créer un utilisateur administrateur
Usage: python manage.py shell < create_admin.py
ou: python manage.py shell puis copier-coller le contenu
"""

from competition.models import User

# Créer un utilisateur admin
admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@podium.com',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    }
)

if created:
    admin.set_password('admin123')
    admin.save()
    print(f"Utilisateur admin créé avec succès!")
    print(f"Username: admin")
    print(f"Password: admin123")
else:
    print("L'utilisateur admin existe déjà.")
    if input("Voulez-vous réinitialiser le mot de passe? (y/n): ").lower() == 'y':
        admin.set_password('admin123')
        admin.save()
        print("Mot de passe réinitialisé à 'admin123'")

