from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Team, Score, Badge, TeamBadge, ActivityLog


@receiver(post_save, sender=Score)
def check_badges_on_score(sender, instance, created, **kwargs):
    """Vérifie les badges après l'ajout d'un score"""
    if created:
        check_and_assign_badges(instance.team)


def check_and_assign_badges(team):
    """Vérifie et attribue les badges à une équipe"""
    badges = Badge.objects.all()
    total_score = team.total_score
    score_count = team.score_count
    
    for badge in badges:
        # Vérifier si l'équipe a déjà ce badge
        if TeamBadge.objects.filter(team=team, badge=badge).exists():
            continue
        
        condition_type = badge.condition_type
        condition_value = badge.condition_value
        
        earned = False
        
        if condition_type == 'score_threshold':
            threshold = condition_value.get('threshold', 0)
            if total_score >= threshold:
                earned = True
        
        elif condition_type == 'score_count':
            count = condition_value.get('count', 0)
            if score_count >= count:
                earned = True
        
        elif condition_type == 'rank':
            rank = condition_value.get('rank', 0)
            # Calculer le rang de l'équipe
            from django.db.models import Sum
            teams = Team.objects.annotate(
                total=Sum('scores__points')
            ).order_by('-total', 'name')
            current_rank = 1
            for t in teams:
                if t.id == team.id:
                    if current_rank <= rank:
                        earned = True
                    break
                current_rank += 1
        
        if earned:
            TeamBadge.objects.create(team=team, badge=badge)
            ActivityLog.objects.create(
                action='badge_earned',
                team=team,
                description=f"L'équipe {team.name} a obtenu le badge {badge.name}",
                metadata={'badge_id': badge.id, 'badge_name': badge.name}
            )

