# Frontend - Podium de Concours

## Installation

1. Installer les dépendances :
```bash
npm install
```

## Lancer l'application

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Configuration

L'application est configurée pour communiquer avec le backend Django sur `http://localhost:8000/api/`

Assurez-vous que le backend Django est lancé avant de démarrer le frontend.

## Authentification

L'application nécessite une authentification pour accéder aux dashboards :
- **Admin** : Accès au dashboard administrateur (`/admin/dashboard`)
- **Leader** : Accès au dashboard leader (`/leader/dashboard`)
- **Public** : Accès au classement uniquement (`/`)

Pour vous connecter, utilisez la page de login (`/login`) avec vos identifiants.
