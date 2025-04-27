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
from apps.logs.models import AuditLog
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
import logging
from django.core.paginator import Paginator
from django.utils import timezone
from django.utils.timezone import localtime
from apps.helpers.audit_log import log_activity
from apps.clients.models import Client
from django.db import IntegrityError
from datetime import datetime


logger = logging.getLogger(__name__)

@method_decorator(login_required, name='dispatch')
class UserListView(View):
    def get(self, request):

        User = get_user_model()

        users = User.objects.all().order_by('-date_joined')

        user_data = []

        for user in users:
            full_name = f"{user.first_name} {user.last_name}".strip() or user.username

            user_data.append({
                'id': user.id,
                'full_name': full_name,
                'role': user.groups.first().name if user.groups.exists() else 'Clerk',
                'username': user.username,
                'email': user.email,
                'current_plan': 'Basic',
                'billing': 'Manual - Credit Card',
                'status': 2 if user.is_active else 3,
                'avatar': '',
                'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '-',
                'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            })

        return JsonResponse({'data': user_data})

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class UserCreateView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)

            User = get_user_model()

            user = User.objects.create_user(
                username=data.get('email'),
                email=data.get('email'),
                password=data.get('password', 'defaultpassword123'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            role = data.get('role', 'Subscriber')

            group, created = Group.objects.get_or_create(name=role)

            user.groups.add(group)

            user.is_active = True

            user.save()

            # Log the user creation activity
            log_activity(section='Users', action='Create', user=request.user, metadata={'user_id': user.id})

            return JsonResponse({
                'status': 'success',
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'full_name': user.first_name or user.username,
                    'role': role,
                    'email': user.email,
                    'status': 2,
                    'last_login': '-',
                    'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S')
                }
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class UserDeleteView(View):
    @method_decorator(login_required)
    @method_decorator(csrf_exempt)
    def post(self, request, user_id):
        try:
            user = get_object_or_404(get_user_model(), id=user_id)
            logger.debug(f"Found user: {user.username}, {user.email}")

            # Store user info for logging before deletion
            username = user.username
            email = user.email

            try:
                user.delete()
                logger.info(f"User {username} ({email}) deleted successfully")

                # Log the activity
                log_activity(section='Users', action='Delete', user=request.user, metadata={'user_id': user.id})

                return JsonResponse({
                    'status': 'success',
                    'message': 'User deleted successfully'
                })
            except ProtectedError as e:
                logger.error(f"Failed to delete user {username} due to foreign key constraints: {str(e)}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Cannot delete user because they have associated records. Please remove or reassign these records first.'
                }, status=400)

        except get_user_model().DoesNotExist:
            logger.error(f"User with ID {user_id} not found")
            return JsonResponse({
                'status': 'error',
                'message': 'User not found'
            }, status=404)
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred while deleting the user'
            }, status=500)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class UserEditView(View):
    def get(self, request, user_id):
        try:
            User = get_user_model()
            user = User.objects.get(id=user_id)

            return JsonResponse({
                'status': 'success',
                'data': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'role': user.groups.first().name if user.groups.exists() else 'Clerk',
                    'status': 2 if user.is_active else 3
                }
            })
        except User.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'User not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    def post(self, request, user_id):
        try:
            User = get_user_model()

            user = User.objects.get(id=user_id)

            # Store old data for logging
            old_data = {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'role': user.groups.first().name if user.groups.exists() else 'Clerk',
                'is_active': user.is_active
            }

            data = json.loads(request.body)

            # Update user fields
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.email = data.get('email', user.email)
            user.is_active = data.get('status', 2) == 2  # 2 is active, 3 is inactive

            # Update role
            new_role = data.get('role', 'Clerk')
            user.groups.clear()
            group, _ = Group.objects.get_or_create(name=new_role)
            user.groups.add(group)

            user.save()

            # Log the edit activity
            log_activity(section='Users', action='Edit', user=request.user, metadata={'user_id': user.id})

            return JsonResponse({
                'status': 'success',
                'message': 'User updated successfully',
                'user': {
                    'id': user.id,
                    'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'role': new_role,
                    'email': user.email,
                    'status': 2 if user.is_active else 3,
                    'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '-',
                    'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S')
                }
            })
        except User.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'User not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class UserStatusUpdateView(View):
    def post(self, request, user_id):
        try:
            User = get_user_model()

            user = User.objects.get(id=user_id)

            old_status = user.is_active

            user.is_active = not user.is_active

            user.save()

            # Log the status change
            log_activity(section='Users', action='Status Update', user=request.user, metadata={'user_id': user.id})

            return JsonResponse({
                'status': 'success',
                'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'User not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
class UserDetailView(DetailView):
    model = get_user_model()
    template_name = 'user-view.html'
    context_object_name = 'user'

    def get_context_data(self, **kwargs):

        context = super().get_context_data(**kwargs)

        context = TemplateLayout.init(self, context)

        # Get recent activity logs for the user
        activity_logs = AuditLog.objects.filter(
            user=self.object
        ).order_by('-timestamp')[:10]

        context['activity_logs'] = activity_logs

        return context

    def get_object(self, queryset=None):

        user = super().get_object(queryset)

        return user

    def get(self, request, *args, **kwargs):

        # Check if this is an AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            self.object = self.get_object()
            activity_logs = AuditLog.objects.filter(
                user=self.object
            ).order_by('-timestamp')[:5]

            formatted_logs = [{
                'action': log.action,
                'section': log.section,
                'description': log.description,
                'status': log.status,
                'timestamp': log.timestamp.isoformat()
            } for log in activity_logs]

            return JsonResponse({
                'status': 'success',
                'activity_logs': formatted_logs
            })

        response = super().get(request, *args, **kwargs)
        return response

class AuditLogView(View):
    def get(self, request, *args, **kwargs):
        draw = int(request.GET.get("draw", 1))
        start = int(request.GET.get("start", 0))
        length = int(request.GET.get("length", 10))

        logs_queryset = AuditLog.objects.select_related('performed_by').order_by('-timestamp')
        records_total = logs_queryset.count()

        logs = logs_queryset[start:start + length]
        records_filtered = logs_queryset.count()

        data = []
        for log in logs:
            user = log.performed_by
            metadata = log.metadata or {}

            data.append({
                "user": user.get_full_name() if user else "Unknown",
                "user_avatar": metadata.get("user_avatar", ""),
                "action": log.action,
                "description": metadata.get("description", ""),
                "timestamp": localtime(log.timestamp).isoformat(),
                "section": log.section,
            })

        return JsonResponse({
            "draw": draw,
            "recordsTotal": records_total,
            "recordsFiltered": records_filtered,
            "data": data
        })

@method_decorator(login_required, name='dispatch')
class ProgramListView(View):
    def get(self, request):
        from apps.programs.models import Program

        programs = Program.objects.all().order_by('-id')
        program_data = []

        for program in programs:
            program_data.append({
                'id': program.id,
                'name': program.name,
                'description': program.description,
                'is_active': program.is_active
            })

        return JsonResponse({'data': program_data})

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ProgramCreateView(View):
    def post(self, request):
        try:
            from apps.programs.models import Program
            data = json.loads(request.body)
            program = Program.objects.create(
                name=data.get('name'),
                description=data.get('description', ''),
                is_active=data.get('is_active', True)
            )
            log_activity(section='Programs', action='Create', user=request.user, metadata={'program_id': program.id})
            return JsonResponse({
                'status': 'success',
                'message': 'Program created successfully',
                'program': {
                    'id': program.id,
                    'name': program.name,
                    'description': program.description,
                    'is_active': program.is_active
                }
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ProgramEditView(View):
    def get(self, request, program_id):
        try:
            from apps.programs.models import Program
            program = Program.objects.get(id=program_id)
            return JsonResponse({
                'status': 'success',
                'data': {
                    'id': program.id,
                    'name': program.name,
                    'description': program.description,
                    'is_active': program.is_active
                }
            })
        except Program.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Program not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    def post(self, request, program_id):
        try:
            from apps.programs.models import Program
            program = Program.objects.get(id=program_id)
            data = json.loads(request.body)

            # Store old data for logging
            old_data = {
                'name': program.name,
                'description': program.description,
                'is_active': program.is_active
            }

            # Update program fields
            program.name = data.get('name', program.name)
            program.description = data.get('description', program.description)
            program.is_active = data.get('is_active', program.is_active)
            program.save()

            # Log the edit activity
            log_activity(section='Programs', action='Edit', user=request.user, metadata={'program_id': program.id})

            return JsonResponse({
                'status': 'success',
                'message': 'Program updated successfully',
                'program': {
                    'id': program.id,
                    'name': program.name,
                    'description': program.description,
                    'is_active': program.is_active
                }
            })
        except Program.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Program not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ProgramDeleteView(View):
    def post(self, request, program_id):
        try:
            from apps.programs.models import Program
            program = Program.objects.get(id=program_id)

            # Store program info for logging before deletion
            program_name = program.name

            try:
                program.delete()
                logger.info(f"Program {program_name} deleted successfully")

                # Log the activity
                log_activity(section='Programs', action='Delete', user=request.user, metadata={'program_id': program_id})

                return JsonResponse({
                    'status': 'success',
                    'message': 'Program deleted successfully'
                })
            except ProtectedError as e:
                logger.error(f"Failed to delete program {program_name} due to foreign key constraints: {str(e)}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Cannot delete program because it has associated records. Please remove or reassign these records first.'
                }, status=400)

        except Program.DoesNotExist:
            logger.error(f"Program with ID {program_id} not found")
            return JsonResponse({
                'status': 'error',
                'message': 'Program not found'
            }, status=404)
        except Exception as e:
            logger.error(f"Error deleting program: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred while deleting the program'
            }, status=500)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ProgramStatusUpdateView(View):
    def post(self, request, program_id):
        try:
            from apps.programs.models import Program
            program = Program.objects.get(id=program_id)

            # Toggle the status
            program.is_active = not program.is_active
            program.save()

            # Log the status change
            log_activity(section='Programs', action='Status Update', user=request.user, metadata={'program_id': program.id})

            return JsonResponse({
                'status': 'success',
                'message': f'Program {"activated" if program.is_active else "deactivated"} successfully',
                'is_active': program.is_active
            })
        except Program.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Program not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
class ClientListView(View):
    def get(self, request):
        clients = Client.objects.all().order_by('-registered_on')
        client_data = []

        for client in clients:
            client_data.append({
                'id': client.id,
                'first_name': client.first_name,
                'last_name': client.last_name,
                'national_id': client.national_id,
                'phone_number': client.phone_number,
                'gender': client.get_gender_display(),
                'date_of_birth': client.date_of_birth.strftime('%Y-%m-%d'),
                'address': client.address,
                'registered_on': client.registered_on.strftime('%Y-%m-%d %H:%M:%S')
            })

        return JsonResponse({'data': client_data})

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ClientCreateView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            from django.db import IntegrityError

            # Validate required fields
            required_fields = ['first_name', 'last_name', 'national_id', 'gender', 'date_of_birth']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)

            # Convert date string to datetime object
            try:
                date_of_birth = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid date format. Please use YYYY-MM-DD format.'
                }, status=400)

            try:
                client = Client.objects.create(
                    first_name=data.get('first_name'),
                    last_name=data.get('last_name'),
                    national_id=data.get('national_id'),
                    phone_number=data.get('phone_number'),
                    gender=data.get('gender'),
                    date_of_birth=date_of_birth,
                    address=data.get('address')
                )

                log_activity(section='Clients', action='Create', user=request.user, metadata={'client_id': client.id})

                return JsonResponse({
                    'status': 'success',
                    'message': 'Client created successfully',
                    'client': {
                        'id': client.id,
                        'first_name': client.first_name,
                        'last_name': client.last_name,
                        'national_id': client.national_id,
                        'phone_number': client.phone_number,
                        'gender': client.get_gender_display(),
                        'date_of_birth': client.date_of_birth.strftime('%Y-%m-%d'),
                        'address': client.address,
                        'registered_on': client.registered_on.strftime('%Y-%m-%d %H:%M:%S')
                    }
                })
            except IntegrityError as e:
                if 'national_id' in str(e):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'A client with this National ID already exists.'
                    }, status=400)
                raise e
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ClientEditView(View):
    def get(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            return JsonResponse({
                'status': 'success',
                'data': {
                    'id': client.id,
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'national_id': client.national_id,
                    'phone_number': client.phone_number,
                    'gender': client.gender,
                    'date_of_birth': client.date_of_birth.strftime('%Y-%m-%d'),
                    'address': client.address
                }
            })
        except Client.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Client not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    def post(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            data = json.loads(request.body)

            # Store old data for logging
            old_data = {
                'first_name': client.first_name,
                'last_name': client.last_name,
                'national_id': client.national_id,
                'phone_number': client.phone_number,
                'gender': client.gender,
                'date_of_birth': client.date_of_birth,
                'address': client.address
            }

            # Convert date string to datetime object if provided
            if 'date_of_birth' in data:
                try:
                    date_of_birth = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date()
                    data['date_of_birth'] = date_of_birth
                except ValueError:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Invalid date format. Please use YYYY-MM-DD format.'
                    }, status=400)

            # Update client fields
            client.first_name = data.get('first_name', client.first_name)
            client.last_name = data.get('last_name', client.last_name)
            client.national_id = data.get('national_id', client.national_id)
            client.phone_number = data.get('phone_number', client.phone_number)
            client.gender = data.get('gender', client.gender)
            if 'date_of_birth' in data:
                client.date_of_birth = data['date_of_birth']
            client.address = data.get('address', client.address)

            client.save()

            # Log the edit activity
            log_activity(section='Clients', action='Edit', user=request.user, metadata={'client_id': client.id})

            return JsonResponse({
                'status': 'success',
                'message': 'Client updated successfully',
                'client': {
                    'id': client.id,
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'national_id': client.national_id,
                    'phone_number': client.phone_number,
                    'gender': client.get_gender_display(),
                    'date_of_birth': client.date_of_birth.strftime('%Y-%m-%d'),
                    'address': client.address,
                    'registered_on': client.registered_on.strftime('%Y-%m-%d %H:%M:%S')
                }
            })
        except Client.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Client not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class ClientDeleteView(View):
    def post(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)

            # Store client info for logging before deletion
            client_name = f"{client.first_name} {client.last_name}"

            try:
                client.delete()
                logger.info(f"Client {client_name} deleted successfully")

                # Log the activity
                log_activity(section='Clients', action='Delete', user=request.user, metadata={'client_id': client_id})

                return JsonResponse({
                    'status': 'success',
                    'message': 'Client deleted successfully'
                })
            except ProtectedError as e:
                logger.error(f"Failed to delete client {client_name} due to foreign key constraints: {str(e)}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Cannot delete client because they have associated records. Please remove or reassign these records first.'
                }, status=400)

        except Client.DoesNotExist:
            logger.error(f"Client with ID {client_id} not found")
            return JsonResponse({
                'status': 'error',
                'message': 'Client not found'
            }, status=404)
        except Exception as e:
            logger.error(f"Error deleting client: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred while deleting the client'
            }, status=500)

@method_decorator(login_required, name='dispatch')
class EnrollmentListView(View):
    def get(self, request):
        from apps.programs.models import Enrollment
        enrollments = Enrollment.objects.select_related('client', 'program').all().order_by('-enrolled_on')
        enrollment_data = []

        for enrollment in enrollments:
            enrollment_data.append({
                'id': enrollment.id,
                'client_id': enrollment.client.id,
                'client_name': f"{enrollment.client.first_name} {enrollment.client.last_name}",
                'program_id': enrollment.program.id,
                'program_name': enrollment.program.name,
                'enrolled_on': enrollment.enrolled_on.strftime('%Y-%m-%d'),
                'status': enrollment.status
            })

        return JsonResponse({'data': enrollment_data})

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class EnrollmentCreateView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            from apps.programs.models import Enrollment
            from apps.clients.models import Client
            from apps.programs.models import Program

            # Validate required fields
            required_fields = ['client_id', 'program_id']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)

            # Check if client exists
            try:
                client = Client.objects.get(id=data.get('client_id'))
            except Client.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Client not found'
                }, status=404)

            # Check if program exists
            try:
                program = Program.objects.get(id=data.get('program_id'))
            except Program.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Program not found'
                }, status=404)

            # Check if enrollment already exists
            if Enrollment.objects.filter(client=client, program=program).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Client is already enrolled in this program'
                }, status=400)

            # Create enrollment
            enrollment = Enrollment.objects.create(
                client=client,
                program=program,
                status=data.get('status', 'active')
            )

            log_activity(section='Enrollments', action='Create', user=request.user, metadata={
                'enrollment_id': enrollment.id,
                'client_id': client.id,
                'program_id': program.id
            })

            return JsonResponse({
                'status': 'success',
                'message': 'Client enrolled successfully',
                'enrollment': {
                    'id': enrollment.id,
                    'client_name': f"{client.first_name} {client.last_name}",
                    'program_name': program.name,
                    'enrolled_on': enrollment.enrolled_on.strftime('%Y-%m-%d'),
                    'status': enrollment.status
                }
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class EnrollmentUpdateView(View):
    def post(self, request, enrollment_id):
        try:
            from apps.programs.models import Enrollment
            enrollment = Enrollment.objects.get(id=enrollment_id)
            data = json.loads(request.body)

            # Update status if provided
            if 'status' in data:
                enrollment.status = data['status']
                enrollment.save()

                log_activity(section='Enrollments', action='Update', user=request.user, metadata={
                    'enrollment_id': enrollment.id,
                    'new_status': data['status']
                })

            return JsonResponse({
                'status': 'success',
                'message': 'Enrollment updated successfully',
                'enrollment': {
                    'id': enrollment.id,
                    'client_name': f"{enrollment.client.first_name} {enrollment.client.last_name}",
                    'program_name': enrollment.program.name,
                    'enrolled_on': enrollment.enrolled_on.strftime('%Y-%m-%d'),
                    'status': enrollment.status
                }
            })
        except Enrollment.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Enrollment not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class EnrollmentDeleteView(View):
    def post(self, request, enrollment_id):
        try:
            from apps.programs.models import Enrollment
            enrollment = Enrollment.objects.get(id=enrollment_id)

            # Store enrollment info for logging before deletion
            enrollment_info = {
                'client_name': f"{enrollment.client.first_name} {enrollment.client.last_name}",
                'program_name': enrollment.program.name
            }

            enrollment.delete()

            log_activity(section='Enrollments', action='Delete', user=request.user, metadata={
                'enrollment_id': enrollment_id,
                'client_name': enrollment_info['client_name'],
                'program_name': enrollment_info['program_name']
            })

            return JsonResponse({
                'status': 'success',
                'message': 'Enrollment deleted successfully'
            })
        except Enrollment.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Enrollment not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@method_decorator(login_required, name='dispatch')
class ClientEnrollmentsView(View):
    def get(self, request, client_id):
        try:
            from apps.programs.models import Enrollment
            from apps.clients.models import Client

            client = Client.objects.get(id=client_id)
            enrollments = Enrollment.objects.filter(client=client).select_related('program')

            enrollment_data = []
            for enrollment in enrollments:
                enrollment_data.append({
                    'id': enrollment.id,
                    'program_id': enrollment.program.id,
                    'program_name': enrollment.program.name,
                    'enrolled_on': enrollment.enrolled_on.strftime('%Y-%m-%d'),
                    'status': enrollment.status
                })

            return JsonResponse({
                'status': 'success',
                'client': {
                    'id': client.id,
                    'name': f"{client.first_name} {client.last_name}",
                    'national_id': client.national_id
                },
                'enrollments': enrollment_data
            })
        except Client.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Client not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
