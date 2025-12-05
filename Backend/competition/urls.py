from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    TeamViewSet, ScoreViewSet, BadgeViewSet, ChallengeViewSet,
    ChallengeProgressViewSet, ActivityLogViewSet,
    register, login, me, dashboard_stats
)

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'scores', ScoreViewSet, basename='score')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'challenges', ChallengeViewSet, basename='challenge')
router.register(r'challenge-progress', ChallengeProgressViewSet, basename='challenge-progress')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/me/', me, name='me'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]
