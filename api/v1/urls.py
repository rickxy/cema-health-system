from django.urls import path
from .views import (
    AuditLogView, UserListView, UserCreateView, UserDeleteView, UserEditView,
    UserStatusUpdateView, UserDetailView, ProgramListView, ProgramCreateView,
    ProgramEditView, ProgramDeleteView, ProgramStatusUpdateView,
    ClientListView, ClientCreateView, ClientEditView, ClientDeleteView,
    EnrollmentListView, EnrollmentCreateView, EnrollmentUpdateView, EnrollmentDeleteView,
    ClientEnrollmentsView
)
from django.contrib.auth.decorators import login_required

urlpatterns = [

    # Users APIs
     path(
        "users/",
        login_required(UserListView.as_view()),
        name="user-list",
    ),
    path(
        "user/create/",
        login_required(UserCreateView.as_view()),
        name="user-create",
    ),
    path(
        "user/<int:user_id>/delete/",
        login_required(UserDeleteView.as_view()),
        name="user-delete",
    ),
    path(
        "user/<int:user_id>/edit/",
        login_required(UserEditView.as_view()),
        name="user-edit",
    ),
    path(
        "user/<int:user_id>/status/",
        login_required(UserStatusUpdateView.as_view()),
        name="user-status-update",
    ),
    path(
        "view/<int:pk>/",
        login_required(UserDetailView.as_view()),
        name="user-detail",
    ),

    #Login APIs
    path(
        "logs/",
        login_required(AuditLogView.as_view()),
        name="logs-list",
    ),

    # Programs APIs
    path("programs/", login_required(ProgramListView.as_view()), name="program-list"),
    path("program/create/", login_required(ProgramCreateView.as_view()), name="program-create"),
    path("program/<int:program_id>/edit/", login_required(ProgramEditView.as_view()), name="program-edit"),
    path("program/<int:program_id>/delete/", login_required(ProgramDeleteView.as_view()), name="program-delete"),
    path("program/<int:program_id>/toggle-status/", login_required(ProgramStatusUpdateView.as_view()), name="program-toggle-status"),

    # Clients APIs
    path("clients/", login_required(ClientListView.as_view()), name="client-list"),
    path("client/create/", login_required(ClientCreateView.as_view()), name="client-create"),
    path("client/<int:client_id>/edit/", login_required(ClientEditView.as_view()), name="client-edit"),
    path("client/<int:client_id>/delete/", login_required(ClientDeleteView.as_view()), name="client-delete"),

    # Enrollments APIs
    path("enrollments/", login_required(EnrollmentListView.as_view()), name="enrollment-list"),
    path("enrollment/create/", login_required(EnrollmentCreateView.as_view()), name="enrollment-create"),
    path("enrollment/<int:enrollment_id>/update/", login_required(EnrollmentUpdateView.as_view()), name="enrollment-update"),
    path("enrollment/<int:enrollment_id>/delete/", login_required(EnrollmentDeleteView.as_view()), name="enrollment-delete"),
    path("client/<int:client_id>/enrollments/", login_required(ClientEnrollmentsView.as_view()), name="client-enrollments"),
]
