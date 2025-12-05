# Backend - Podium de Concours

## Installation

1. Créer un environnement virtuel :
```bash
python -m venv venv_backend
```

2. Activer l'environnement virtuel :
- Windows (PowerShell) :
```bash
.\venv_backend\Scripts\Activate.ps1
```
- Linux/Mac :
```bash
source venv_backend/bin/activate
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Lancer le serveur

1. Activer l'environnement virtuel (voir ci-dessus)

2. Appliquer les migrations :
```bash
python manage.py migrate
```

3. Créer un utilisateur administrateur :
```bash
python manage.py shell
```
Puis dans le shell Python :
```python
from competition.models import User
admin = User.objects.create_user('admin', 'admin@podium.com', 'admin123', role='admin', is_staff=True, is_superuser=True)
print("Admin créé: username=admin, password=admin123")
```

4. Lancer le serveur de développement :
```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://localhost:8000`

L'API sera disponible sur `http://localhost:8000/api/`

