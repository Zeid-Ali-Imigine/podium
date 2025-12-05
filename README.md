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

## ⚙️ Installation et Démarrage Rapide

Ce guide est optimisé pour un démarrage rapide sous **Windows**.

### 1. Backend (API Django)

Ouvrez un terminal (PowerShell ou Command Prompt) et suivez ces instructions :

1. **Accédez au dossier Backend** :
   ```bash
   cd Backend
   ```

2. **Configuration Environnement & Dépendances** :
   ```bash
   # Création de l'environnement virtuel
   python -m venv venv
   
   # Activation (Windows)
   .\venv\Scripts\activate
   
   # Installation des dépendances
   pip install -r requirements.txt
   ```

3. **Base de Données & Données Initiales** :
   Préparez la base de données et chargez automatiquement les données de test (Utilisateurs, Équipes, Scores).
   ```bash
   # Migrations
   python manage.py makemigrations
   python manage.py migrate
   
   # Création automatique de l'admin (admin/admin123)
   python manage.py shell < create_admin.py
   
   # Génération de données de démonstration
   python manage.py shell < create_test_data.py
   ```

4. **Lancer le Serveur** :
   ```bash
   python manage.py runserver
   ```
   ✅ Le backend est actif sur `http://localhost:8000`.

### 2. Frontend (Interface React)

Ouvrez un **nouveau** terminal (gardez le premier ouvert) :

1. **Accédez au dossier Frontend** :
   ```bash
   cd Frontend
   ```

2. **Installation & Lancement** :
   ```bash
   # Installation des paquets
   npm install
   
   # Lancement
   npm start
   ```
   ✅ L'interface s'ouvrira automatiquement sur `http://localhost:3000`.

---

## 📱 Utilisation

Une fois les deux serveurs lancés :

1. **Accès Administrateur** : 
   - Allez sur `http://localhost:3000/login`
   - Connectez-vous avec : 
     - **Email** : `admin@podium.com` / **Utilisateur** : `admin`
     - **Mot de passe** : `admin123`

2. **Fonctionnalités Disponibles** :
   - **Tableau de Bord** : Vue d'ensemble des scores et classements.
   - **Gestion** : Créez de nouvelles équipes ou leaders.
   - **Simulation** : Les données de test vous permettent de voir immédiatement à quoi ressemble l'application remplie.

## 📂 Structure du Projet

```
podium/
├── Backend/            # API Django
│   ├── competition/    # App principale
│   ├── create_admin.py # Script auto-admin
│   ├── create_test_data.py # Script données démo
│   └── manage.py
│
├── Frontend/           # App React
│   ├── src/
│   │   ├── components/ # Composants UI
│   │   ├── contexts/   # Auth & État
│   │   └── pages/      # Vues principales
│   └── package.json
└── README.md
```

## 🎨 Design & Technologies

- **Frontend** : React.js, Recharts, CSS Modules (Dark Mode, Glassmorphism).
- **Backend** : Django REST Framework, SQLite.
- **Style** : Palette de couleurs moderne (Indigo/Violet) optimisée pour le contraste et l'esthétique.

## ❓ Dépannage

- **Erreur "python introuvable"** : Assurez-vous d'avoir ajouté Python au PATH lors de l'installation, ou utilisez `py` au lieu de `python`.
- **Erreur "npm"** : Installez Node.js depuis le site officiel.
- **Scripts PowerShell bloqués** : Si l'activation du venv échoue, exécutez `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` dans PowerShell.
