from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_leader() or request.user.is_admin())


class IsLeaderOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_leader() or request.user.is_admin())


class IsTeamLeader(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin():
            return True
        if hasattr(obj, 'leader'):
            return obj.leader == request.user
        if hasattr(obj, 'team') and hasattr(obj.team, 'leader'):
            return obj.team.leader == request.user
        return False

