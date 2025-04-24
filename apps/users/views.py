from django.views.generic import TemplateView, DetailView
from web_project import TemplateLayout
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.models import Group
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

class DashboardView(TemplateView):

    def get_context_data(self, **kwargs):

        context = TemplateLayout.init(self, super().get_context_data(**kwargs))

        roles = Group.objects.all().order_by('name')

        context['roles'] = roles

        return context
