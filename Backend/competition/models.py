from django.db import models
from django.db.models import Sum
from django.core.validators import MinValueValidator
from django.contrib.auth.models import AbstractUser
import json


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('leader', 'Leader'),
        ('user', 'Utilisateur'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_leader(self):
        return self.role == 'leader'


class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='🏅')  # Emoji ou nom d'icône
    condition_type = models.CharField(max_length=50)  # 'score_threshold', 'score_count', 'rank', etc.
    condition_value = models.JSONField(default=dict)  # {'threshold': 100} ou {'count': 5}
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    leader = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_team')
    badges = models.ManyToManyField(Badge, through='TeamBadge', related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def total_score(self):
        return self.scores.aggregate(total=Sum('points'))['total'] or 0
    
    @property
    def score_count(self):
        return self.scores.count()
    
    def check_badges(self):
        """Vérifie et attribue les badges automatiquement"""
        from .signals import check_and_assign_badges
        check_and_assign_badges(self)


class TeamBadge(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['team', 'badge']
        ordering = ['-earned_at']


class Challenge(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    points_reward = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.name


class ChallengeProgress(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='challenge_progresses')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='progresses')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_data = models.JSONField(default=dict)  # Pour stocker la progression
    
    class Meta:
        unique_together = ['team', 'challenge']
    
    def __str__(self):
        return f"{self.team.name} - {self.challenge.name}"


class Score(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='scores')
    points = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    description = models.CharField(max_length=500, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.team.name} - {self.points} points"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Vérifier les badges après sauvegarde
        self.team.check_badges()


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('team_created', 'Équipe créée'),
        ('team_updated', 'Équipe modifiée'),
        ('team_deleted', 'Équipe supprimée'),
        ('score_added', 'Score ajouté'),
        ('score_updated', 'Score modifié'),
        ('score_deleted', 'Score supprimé'),
        ('badge_earned', 'Badge obtenu'),
        ('challenge_completed', 'Défi complété'),
    ]
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    metadata = models.JSONField(default=dict)  # Données supplémentaires
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} - {self.created_at}"
