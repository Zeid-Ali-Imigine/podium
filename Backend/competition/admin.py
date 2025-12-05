from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Team, Score, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rôle', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Rôle', {'fields': ('role',)}),
    )


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'leader', 'total_score', 'created_at']
    search_fields = ['name', 'leader__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ['team', 'points', 'description', 'created_by', 'created_at']
    list_filter = ['created_at', 'team']
    search_fields = ['team__name', 'description', 'created_by__username']
    readonly_fields = ['created_at']
