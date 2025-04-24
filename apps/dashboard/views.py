from django.views.generic import TemplateView
from django.contrib.auth.models import User
from web_project import TemplateLayout


"""
This file is a view controller for multiple pages as a module.
Here you can override the page view layout.
Refer to dashboards/urls.py file for more pages.
"""

class DashboardView(TemplateView):
    def get_context_data(self, **kwargs):
        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        context['active_users_count'] = User.objects.filter(is_active=True).count()

        return context
