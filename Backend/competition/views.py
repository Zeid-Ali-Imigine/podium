from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum, Count, Q
from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
import csv
import json
from .models import (
    Team, Score, User, Badge, TeamBadge, Challenge, 
    ChallengeProgress, ActivityLog
)
from .serializers import (
    TeamSerializer, TeamListSerializer, ScoreSerializer, 
    LeaderboardSerializer, UserSerializer, UserRegisterSerializer,
    BadgeSerializer, ChallengeSerializer, ChallengeProgressSerializer,
    ActivityLogSerializer
)
from .permissions import IsAdmin, IsLeaderOrAdmin, IsTeamLeader


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TeamListSerializer
        return TeamSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'leaderboard', 'stats', 'export']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = Team.objects.all()
        # Filtres
        search = self.request.query_params.get('search', None)
        min_score = self.request.query_params.get('min_score', None)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if min_score:
            queryset = queryset.annotate(total=Sum('scores__points')).filter(total__gte=int(min_score))
        return queryset
    
    def perform_create(self, serializer):
        team = serializer.save()
        ActivityLog.objects.create(
            action='team_created',
            user=self.request.user,
            team=team,
            description=f"L'équipe {team.name} a été créée",
            metadata={'team_id': team.id}
        )
    
    def perform_update(self, serializer):
        team = serializer.save()
        ActivityLog.objects.create(
            action='team_updated',
            user=self.request.user,
            team=team,
            description=f"L'équipe {team.name} a été modifiée",
            metadata={'team_id': team.id}
        )
    
    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            action='team_deleted',
            user=self.request.user,
            team=instance,
            description=f"L'équipe {instance.name} a été supprimée",
            metadata={'team_id': instance.id}
        )
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[IsLeaderOrAdmin])
    def add_score(self, request, pk=None):
        team = self.get_object()
        if not request.user.is_admin() and team.leader != request.user:
            return Response(
                {'error': 'Vous n\'avez pas la permission d\'ajouter des scores à cette équipe.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        points = request.data.get('points', 0)
        description = request.data.get('description', '')
        
        score = Score.objects.create(
            team=team,
            points=points,
            description=description,
            created_by=request.user
        )
        
        ActivityLog.objects.create(
            action='score_added',
            user=request.user,
            team=team,
            description=f"{points} points ajoutés à {team.name}",
            metadata={'score_id': score.id, 'points': points}
        )
        
        serializer = ScoreSerializer(score)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def leaderboard(self, request):
        teams = Team.objects.annotate(
            total_score=Sum('scores__points')
        ).order_by('-total_score', 'name')
        
        # Filtres
        limit = request.query_params.get('limit', None)
        if limit:
            teams = teams[:int(limit)]
        
        ranked_teams = []
        rank = 1
        prev_score = None
        
        for team in teams:
            current_score = team.total_score or 0
            if prev_score is not None and current_score < prev_score:
                rank = len(ranked_teams) + 1
            ranked_teams.append({
                'id': team.id,
                'name': team.name,
                'description': team.description,
                'leader_username': team.leader.username if team.leader else None,
                'total_score': current_score,
                'rank': rank,
                'created_at': team.created_at
            })
            prev_score = current_score
        
        serializer = LeaderboardSerializer(ranked_teams, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_teams(self, request):
        if request.user.is_admin():
            teams = Team.objects.all()
        else:
            teams = Team.objects.filter(leader=request.user)
        serializer = TeamListSerializer(teams, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request, pk=None):
        team = self.get_object()
        scores = team.scores.all().order_by('created_at')
        
        # Évolution du score dans le temps
        score_evolution = []
        cumulative = 0
        for score in scores:
            cumulative += score.points
            score_evolution.append({
                'date': score.created_at.isoformat(),
                'points': score.points,
                'cumulative': cumulative
            })
        
        return Response({
            'total_score': team.total_score,
            'score_count': team.score_count,
            'evolution': score_evolution,
            'badges_count': team.teambadge_set.count()
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="teams.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nom', 'Description', 'Leader', 'Score Total', 'Nombre de scores', 'Date de création'])
        
        teams = Team.objects.annotate(
            total_score=Sum('scores__points'),
            score_count=Count('scores')
        )
        
        for team in teams:
            writer.writerow([
                team.id,
                team.name,
                team.description,
                team.leader.username if team.leader else '',
                team.total_score or 0,
                team.score_count,
                team.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response


class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'export']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLeaderOrAdmin()]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = Score.objects.all()
        team_id = self.request.query_params.get('team', None)
        if team_id is not None:
            queryset = queryset.filter(team_id=team_id)
        
        if not self.request.user.is_admin():
            queryset = queryset.filter(team__leader=self.request.user)
        
        return queryset
    
    def perform_create(self, serializer):
        score = serializer.save(created_by=self.request.user)
        ActivityLog.objects.create(
            action='score_added',
            user=self.request.user,
            team=score.team,
            description=f"{score.points} points ajoutés à {score.team.name}",
            metadata={'score_id': score.id, 'points': score.points}
        )
    
    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            action='score_deleted',
            user=self.request.user,
            team=instance.team,
            description=f"Score supprimé de {instance.team.name}",
            metadata={'score_id': instance.id, 'points': instance.points}
        )
        instance.delete()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="scores.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Équipe', 'Points', 'Description', 'Créé par', 'Date'])
        
        scores = Score.objects.select_related('team', 'created_by')
        for score in scores:
            writer.writerow([
                score.id,
                score.team.name,
                score.points,
                score.description,
                score.created_by.username if score.created_by else '',
                score.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response


class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAdmin]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_progress']:
            return [IsAuthenticated()]
        return [IsAdmin()]


class ChallengeProgressViewSet(viewsets.ModelViewSet):
    queryset = ChallengeProgress.objects.all()
    serializer_class = ChallengeProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ChallengeProgress.objects.all()
        if not self.request.user.is_admin():
            queryset = queryset.filter(team__leader=self.request.user)
        return queryset


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = ActivityLog.objects.all()
        team_id = self.request.query_params.get('team', None)
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        return queryset[:100]  # Limiter à 100 derniers


@api_view(['GET'])
@permission_classes([IsAdmin])
def dashboard_stats(request):
    """Statistiques globales pour le dashboard admin"""
    total_teams = Team.objects.count()
    total_scores = Score.objects.count()
    total_points = Score.objects.aggregate(total=Sum('points'))['total'] or 0
    avg_score = total_points / total_teams if total_teams > 0 else 0
    
    # Évolution des scores sur les 30 derniers jours
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_scores = Score.objects.filter(created_at__gte=thirty_days_ago)
    
    # Top 5 équipes
    top_teams = Team.objects.annotate(
        total_score=Sum('scores__points')
    ).order_by('-total_score')[:5]
    
    return Response({
        'total_teams': total_teams,
        'total_scores': total_scores,
        'total_points': total_points,
        'avg_score': round(avg_score, 2),
        'recent_scores_count': recent_scores.count(),
        'top_teams': TeamListSerializer(top_teams, many=True).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
    
    return Response(
        {'error': 'Nom d\'utilisateur ou mot de passe incorrect.'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)
