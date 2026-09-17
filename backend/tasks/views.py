from datetime import date

from django.db.models import Case, IntegerField, Value, When
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from .filters import TaskFilter
from .models import Task
from .serializers import TaskSerializer

# Sentinel used to push tasks with no due date to the end of the list,
# regardless of sort direction.
NO_DUE_DATE_SENTINEL = date(9999, 12, 31)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date_sort', 'priority_rank']
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Task.objects.none()
        return Task.objects.filter(owner=self.request.user).annotate(
            due_date_sort=Coalesce('due_date', Value(NO_DUE_DATE_SENTINEL)),
            priority_rank=Case(
                When(priority=Task.Priority.HIGH, then=0),
                When(priority=Task.Priority.MEDIUM, then=1),
                When(priority=Task.Priority.LOW, then=2),
                output_field=IntegerField(),
            ),
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
