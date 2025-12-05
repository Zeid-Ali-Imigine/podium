"""
Script pour créer des données de test
Usage: python manage.py shell < create_test_data.py
"""

from competition.models import User, Team, Score, Badge, Challenge
from django.utils import timezone
from datetime import timedelta
import random

# Créer des badges
badges_data = [
    {'name': 'Premier pas', 'description': 'Obtenir 100 points', 'icon': '🥉', 'condition_type': 'score_threshold', 'condition_value': {'threshold': 100}},
    {'name': 'Champion', 'description': 'Obtenir 500 points', 'icon': '🥈', 'condition_type': 'score_threshold', 'condition_value': {'threshold': 500}},
    {'name': 'Légende', 'description': 'Obtenir 1000 points', 'icon': '🥇', 'condition_type': 'score_threshold', 'condition_value': {'threshold': 1000}},
    {'name': 'Actif', 'description': 'Ajouter 5 scores', 'icon': '⭐', 'condition_type': 'score_count', 'condition_value': {'count': 5}},
    {'name': 'Top 3', 'description': 'Être dans le top 3', 'icon': '🏆', 'condition_type': 'rank', 'condition_value': {'rank': 3}},
]

print("Création des badges...")
for badge_data in badges_data:
    badge, created = Badge.objects.get_or_create(
        name=badge_data['name'],
        defaults=badge_data
    )
    if created:
        print(f"  ✓ Badge créé: {badge.name}")

# Créer des équipes
teams_data = [
    {'name': 'Les Champions', 'description': 'Équipe de développement web'},
    {'name': 'Code Masters', 'description': 'Spécialistes en programmation'},
    {'name': 'Tech Warriors', 'description': 'Experts en technologies'},
    {'name': 'Digital Ninjas', 'description': 'Maîtres du numérique'},
    {'name': 'Innovation Squad', 'description': 'Pionniers de l\'innovation'},
    {'name': 'Elite Coders', 'description': 'Programmeurs d\'élite'},
    {'name': 'Web Wizards', 'description': 'Magiciens du web'},
    {'name': 'Data Heroes', 'description': 'Héros des données'},
]

print("\nCréation des équipes...")
leaders = User.objects.filter(role='leader')
if not leaders.exists():
    # Créer des leaders si nécessaire
    for i in range(3):
        leader = User.objects.create_user(
            username=f'leader{i+1}',
            email=f'leader{i+1}@podium.com',
            password='leader123',
            role='leader'
        )
        leaders = User.objects.filter(role='leader')

teams = []
for i, team_data in enumerate(teams_data):
    team, created = Team.objects.get_or_create(
        name=team_data['name'],
        defaults={
            'description': team_data['description'],
            'leader': leaders[i % leaders.count()] if leaders.exists() else None
        }
    )
    teams.append(team)
    if created:
        print(f"  ✓ Équipe créée: {team.name}")

# Créer des scores pour chaque équipe
print("\nCrée des scores...")
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    admin_user = User.objects.filter(is_superuser=True).first()

score_descriptions = [
    'Projet terminé avec succès',
    'Défi relevé',
    'Mission accomplie',
    'Objectif atteint',
    'Performance exceptionnelle',
    'Innovation remarquable',
    'Collaboration efficace',
    'Qualité du travail',
]

for team in teams:
    num_scores = random.randint(3, 10)
    for i in range(num_scores):
        points = random.randint(10, 100)
        description = random.choice(score_descriptions)
        created_at = timezone.now() - timedelta(days=random.randint(0, 30))
        
        score = Score.objects.create(
            team=team,
            points=points,
            description=description,
            created_by=admin_user,
            created_at=created_at
        )
    print(f"  ✓ {num_scores} scores créés pour {team.name}")

# Créer des défis
print("\nCréation des défis...")
challenges_data = [
    {'name': 'Défi Sprint', 'description': 'Terminer un projet en une semaine', 'points_reward': 50},
    {'name': 'Défi Qualité', 'description': 'Obtenir une note parfaite', 'points_reward': 75},
    {'name': 'Défi Innovation', 'description': 'Proposer une solution innovante', 'points_reward': 100},
]

for challenge_data in challenges_data:
    challenge, created = Challenge.objects.get_or_create(
        name=challenge_data['name'],
        defaults=challenge_data
    )
    if created:
        print(f"  ✓ Défi créé: {challenge.name}")

print("\n✅ Données de test créées avec succès!")
print(f"   - {Badge.objects.count()} badges")
print(f"   - {Team.objects.count()} équipes")
print(f"   - {Score.objects.count()} scores")
print(f"   - {Challenge.objects.count()} défis")

