from django.urls import path
from .views import DashboardView
from django.contrib.auth.decorators import login_required


urlpatterns = [
    path(
        "",
        login_required(DashboardView.as_view(template_name="programs-dashboard.html")),
        name="program-index",
    ),
    path(
        "enrollments/",
        login_required(DashboardView.as_view(template_name="enrollments-dashboard.html")),
        name="enrollment-index",
    ),

]
