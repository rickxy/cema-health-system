from django.views.generic import TemplateView
from django.contrib.auth.models import User
from web_project import TemplateLayout
from apps.clients.models import Client
from apps.programs.models import Program, Enrollment
from django.db.models import Count, Q, Avg, F, ExpressionWrapper, FloatField
from django.utils import timezone
from datetime import timedelta


"""
This file is a view controller for multiple pages as a module.
Here you can override the page view layout.
Refer to dashboards/urls.py file for more pages.
"""

class DashboardView(TemplateView):
    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        # Get total active users
        context['active_users_count'] = User.objects.filter(is_active=True).count()

        # Get client statistics
        total_clients = Client.objects.count()
        context['total_clients'] = total_clients

        # Get recent clients (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_clients = Client.objects.filter(registered_on__gte=thirty_days_ago)
        context['recent_clients'] = recent_clients
        context['recent_clients_count'] = recent_clients.count()

        # Get program statistics
        total_programs = Program.objects.count()
        active_programs = Program.objects.filter(is_active=True).count()
        context['total_programs'] = total_programs
        context['active_programs'] = active_programs

        # Get enrollment statistics
        total_enrollments = Enrollment.objects.count()
        active_enrollments = Enrollment.objects.filter(status='active').count()
        completed_enrollments = Enrollment.objects.filter(status='completed').count()
        dropped_enrollments = Enrollment.objects.filter(status='dropped').count()
        context['total_enrollments'] = total_enrollments
        context['active_enrollments'] = active_enrollments
        context['completed_enrollments'] = completed_enrollments
        context['dropped_enrollments'] = dropped_enrollments

        # Get recent enrollments
        recent_enrollments = Enrollment.objects.select_related('client', 'program').order_by('-enrolled_on')[:5]
        context['recent_enrollments'] = recent_enrollments

        # Get gender distribution
        gender_distribution = Client.objects.values('gender').annotate(count=Count('id'))
        context['gender_distribution'] = gender_distribution

        # Get program enrollment distribution
        program_distribution = Program.objects.annotate(
            enrollment_count=Count('enrollment')
        ).order_by('-enrollment_count')[:5]
        context['program_distribution'] = program_distribution

        # Additional statistics
        # Average enrollments per program
        avg_enrollments = Enrollment.objects.values('program').annotate(
            count=Count('id')
        ).aggregate(avg=Avg('count'))['avg'] or 0
        context['avg_enrollments_per_program'] = round(avg_enrollments, 1)

        # Enrollment completion rate
        completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
        context['completion_rate'] = round(completion_rate, 1)

        # Active enrollment rate
        active_rate = (active_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
        context['active_rate'] = round(active_rate, 1)

        # Dropout rate
        dropout_rate = (dropped_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
        context['dropout_rate'] = round(dropout_rate, 1)

        # Programs with most enrollments
        top_programs = Program.objects.annotate(
            enrollment_count=Count('enrollment')
        ).order_by('-enrollment_count')[:3]
        context['top_programs'] = top_programs

        # Recent program completions (last 30 days)
        recent_completions = Enrollment.objects.filter(
            status='completed',
            enrolled_on__gte=thirty_days_ago
        ).count()
        context['recent_completions'] = recent_completions

        # Average enrollments per client
        avg_enrollments_per_client = Enrollment.objects.values('client').annotate(
            count=Count('id')
        ).aggregate(avg=Avg('count'))['avg'] or 0
        context['avg_enrollments_per_client'] = round(avg_enrollments_per_client, 1)

        # Program success rate (completed vs total enrollments)
        success_rate = (completed_enrollments / (total_enrollments - dropped_enrollments) * 100) if (total_enrollments - dropped_enrollments) > 0 else 0
        context['success_rate'] = round(success_rate, 1)

        return context
