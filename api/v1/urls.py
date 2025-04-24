from django.urls import path
from .views import AuditLogView, UserListView, UserCreateView, UserDeleteView, UserEditView, UserStatusUpdateView, UserDetailView
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
]
