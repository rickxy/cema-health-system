from apps.logs.models import AuditLog

def log_activity(section: str, action: str, user=None, metadata=None):
    """
    Logs a user action to the AuditLog.

    Parameters:
    - section (str): Section of the app where the action occurred.
    - action (str): Description of the action.
    - user (User, optional): The user performing the action.
    - metadata (dict, optional): Optional dictionary for additional info.
    """
    AuditLog.objects.create(
        section=section,
        action=action,
        performed_by=user if user and getattr(user, 'is_authenticated', False) else None,
        metadata=metadata or {}
    )
