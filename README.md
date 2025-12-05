# Podium - Plateforme de Gestion de Compétition

Une application web moderne et interactive conçue pour gérer des compétitions, suivre les performances des équipes et visualiser les classements en temps réel. Le projet arbore une interface utilisateur soignée avec un design "Dark Mode" immersif et des effets de verre (Glassmorphism).

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Équipes & Rôles
- **Administrateur** : Contrôle total sur la plateforme. Peut créer, modifier et supprimer des équipes, gérer les utilisateurs et attribuer des points.
- **Leader d'Équipe** : Rôle dédié aux capitaines. Un leader est associé à une seule équipe. Il peut visualiser les statistiques détaillées de son équipe et suivre sa progression via un tableau de bord dédié.

### 📊 Tableau de Bord (Dashboard)
- **Statistiques en Temps Réel** : Total des points, nombre d'équipes, scores moyens.
- **Visualisation de Données** : Graphiques interactifs (courbes, bâtons, camemberts) pour analyser la répartition des scores et les tendances.
- **Journal d'Activité** : Historique complet des actions (création d'équipe, ajout de points, etc.) pour une traçabilité parfaite.

### 🏆 Classement & Compétition
- **Leaderboard Dynamique** : Classement mis à jour automatiquement en fonction des points.
- **Système de Points** : Attribution de points avec descriptions pour chaque action.
- **Badges & Challenges** : (Extension) Support pour la gamification avec badges et défis.

## 🛠 Technologies Utilisées

### Backend
- **Framework** : Django & Django REST Framework (Python)
- **Base de Données** : SQLite (Dev)
- **Authentification** : JWT (JSON Web Tokens)

### Frontend
- **Framework** : React.js
- **Chart.js / Recharts** : Pour la visualisation des données graphiques.
- **Moteur de Style** : CSS Vanilla avec variables CSS pour une personnalisation facile (Thèmes).

## ⚙️ Installation et Configuration

Suivez ces étapes pour lancer le projet localement.

### Prérequis
- Python 3.8+
- Node.js & npm

### 1. Installation du Backend

Rendez-vous dans le dossier Backend :
```bash
cd Backend
```

Créez et activez un environnement virtuel :
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Installez les dépendances :
```bash
pip install -r requirements.txt
```

Appliquez les migrations de la base de données :
```bash
python manage.py makemigrations
python manage.py migrate
```

Créez un compte administrateur :
```bash
python manage.py createsuperuser
```

Lancez le serveur de développement :
```bash
python manage.py runserver
```
 Le backend sera accessible sur `http://localhost:8000`.

### 2. Installation du Frontend

Ouvrez un nouveau terminal et rendez-vous dans le dossier Frontend :
```bash
cd Frontend
```

Installez les dépendances Node :
```bash
npm install
```

Lancez l'application React :
```bash
npm start
```
L'application s'ouvrira sur `http://localhost:3000`.

## 📱 Utilisation

1. **Connexion** : Utilisez le compte superutilisateur créé pour vous connecter en tant qu'Admin.
2. **Créer des Leaders** : Depuis l'interface Admin ou via l'inscription, créez des comptes utilisateurs. Assignez-leur le rôle "Leader" si nécessaire (via l'admin Django ou l'interface si implémentée).
3. **Gérer les Équipes** : Créez des équipes et assignez des leaders.
4. **Suivre les Scores** : Ajoutez des points aux équipes et observez le classement évoluer en direct.

## 📂 Structure du Projet

```
podium/
├── Backend/            # API Django
│   ├── competition/    # App principale (Models, Views, Serializers)
│   ├── podium_backend/ # Configuration du projet
│   └── manage.py
│
├── Frontend/           # App React
│   ├── public/
│   └── src/
│       ├── components/ # Composants réutilisables (Layout, Charts...)
│       ├── contexts/   # Gestion d'état (AuthContext)
│       ├── pages/      # Pages principales (Dashboard, Login...)
│       └── services/   # Appels API (axios)
└── README.md
```

## 🎨 Design

Le projet utilise un système de variables CSS pour faciliter la maintenance du thème graphique. Le thème par défaut est un mode sombre moderne utilisant des nuances de gris profond (`#030712`, `#111827`) et des accents vibrants (Indigo, Violet, Rose).
