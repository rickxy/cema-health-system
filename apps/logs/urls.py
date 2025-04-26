from django.urls import path
from .views import DashboardView
from django.contrib.auth.decorators import login_required


urlpatterns = [
    path(
        "",
        login_required(DashboardView.as_view(template_name="logs-dashboard.html")),
        name="log-index",
    ),

]
