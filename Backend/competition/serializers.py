from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Team, Score, User, Badge, TeamBadge, Challenge, ChallengeProgress, ActivityLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id', 'role']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'condition_type', 'condition_value']


class TeamBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = TeamBadge
        fields = ['badge', 'earned_at']


class ScoreSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Score
        fields = ['id', 'points', 'description', 'created_by', 'created_by_username', 'created_at']


class TeamSerializer(serializers.ModelSerializer):
    total_score = serializers.ReadOnlyField()
    score_count = serializers.ReadOnlyField()
    scores = ScoreSerializer(many=True, read_only=True)
    leader_username = serializers.SerializerMethodField()
    badges = TeamBadgeSerializer(source='teambadge_set', many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'leader', 'leader_username', 'total_score', 'score_count', 'scores', 'badges', 'created_at', 'updated_at']

    def get_leader_username(self, obj):
        return obj.leader.username if obj.leader else None


class TeamListSerializer(serializers.ModelSerializer):
    total_score = serializers.SerializerMethodField()
    leader_username = serializers.SerializerMethodField()
    badges_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'leader', 'leader_username', 'total_score', 'badges_count', 'progress', 'created_at', 'updated_at']
    
    def get_total_score(self, obj):
        # Return annotated value if available (from dashboard_stats), otherwise model property
        return getattr(obj, 'total_score_annotated', obj.total_score)

    def get_badges_count(self, obj):
        return obj.teambadge_set.count()

    def get_leader_username(self, obj):
        return obj.leader.username if obj.leader else None
        
    def get_progress(self, obj):
        total = Challenge.objects.filter(is_active=True).count()
        if total == 0:
            return 0
        completed = obj.challenge_progresses.filter(is_completed=True, challenge__is_active=True).count()
        return round((completed / total) * 100)


class LeaderboardSerializer(serializers.ModelSerializer):
    total_score = serializers.SerializerMethodField()
    rank = serializers.IntegerField(read_only=True)
    leader_username = serializers.SerializerMethodField()
    badges = TeamBadgeSerializer(source='teambadge_set', many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'leader_username', 'total_score', 'rank', 'badges', 'created_at']

    def get_total_score(self, obj):
        # Prioritize annotated value, fallback to property
        return getattr(obj, 'annotated_total_score', getattr(obj, 'total_score_annotated', obj.total_score))

    def get_leader_username(self, obj):
        return obj.leader.username if obj.leader else None


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ['id', 'name', 'description', 'points_reward', 'is_active', 'created_at', 'expires_at']


class ChallengeProgressSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = ChallengeProgress
        fields = ['id', 'team', 'team_name', 'challenge', 'is_completed', 'completed_at', 'progress_data']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'user', 'user_username', 'team', 'team_name', 'description', 'metadata', 'created_at']
