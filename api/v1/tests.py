from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from apps.clients.models import Client as ClientModel
from apps.programs.models import Program, Enrollment
from django.utils import timezone
from datetime import datetime, timedelta
import json

User = get_user_model()

class BaseTestCase(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user.is_staff = True
        self.user.save()

        # Create test group
        self.group = Group.objects.create(name='Admin')
        self.user.groups.add(self.group)

        # Create test client
        self.client_model = ClientModel.objects.create(
            first_name='John',
            last_name='Doe',
            national_id='1234567890',
            gender='M',
            date_of_birth=datetime.now().date(),
            phone_number='1234567890',
            address='Test Address'
        )

        # Create test program
        self.program = Program.objects.create(
            name='Test Program',
            description='Test Description',
            is_active=True
        )

        # Create test enrollment
        self.enrollment = Enrollment.objects.create(
            client=self.client_model,
            program=self.program,
            status='active'
        )

        # Set up test client
        self.client = Client()
        self.client.login(username='testuser', password='testpass123')

class UserTests(BaseTestCase):
    def test_user_list_view(self):
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue('data' in data)
        self.assertEqual(len(data['data']), 1)

    def test_user_create_view(self):
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'Admin'
        }
        response = self.client.post(
            reverse('user-create'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_user_delete_view(self):
        new_user = User.objects.create_user(
            username='deleteuser',
            email='delete@example.com',
            password='deletepass123'
        )
        response = self.client.post(reverse('user-delete', args=[new_user.id]))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(email='delete@example.com').exists())

class ProgramTests(BaseTestCase):
    def test_program_list_view(self):
        response = self.client.get(reverse('program-list'))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue('data' in data)
        self.assertEqual(len(data['data']), 1)

    def test_program_create_view(self):
        data = {
            'name': 'New Program',
            'description': 'New Description',
            'is_active': True
        }
        response = self.client.post(
            reverse('program-create'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Program.objects.filter(name='New Program').exists())

    def test_program_delete_view(self):
        new_program = Program.objects.create(
            name='Delete Program',
            description='Delete Description',
            is_active=True
        )
        response = self.client.post(reverse('program-delete', args=[new_program.id]))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Program.objects.filter(name='Delete Program').exists())

class ClientTests(BaseTestCase):
    def test_client_list_view(self):
        response = self.client.get(reverse('client-list'))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue('data' in data)
        self.assertEqual(len(data['data']), 1)

    def test_client_create_view(self):
        data = {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'national_id': '0987654321',
            'gender': 'F',
            'date_of_birth': '1990-01-01',
            'phone_number': '0987654321',
            'address': 'New Address'
        }
        response = self.client.post(
            reverse('client-create'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(ClientModel.objects.filter(national_id='0987654321').exists())

    def test_client_delete_view(self):
        new_client = ClientModel.objects.create(
            first_name='Delete',
            last_name='Client',
            national_id='1111111111',
            gender='M',
            date_of_birth=datetime.now().date(),
            phone_number='1111111111',
            address='Delete Address'
        )
        response = self.client.post(reverse('client-delete', args=[new_client.id]))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(ClientModel.objects.filter(national_id='1111111111').exists())

class EnrollmentTests(BaseTestCase):
    def test_enrollment_list_view(self):
        response = self.client.get(reverse('enrollment-list'))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue('data' in data)
        self.assertEqual(len(data['data']), 1)

    def test_enrollment_create_view(self):
        data = {
            'client_id': self.client_model.id,
            'program_id': self.program.id,
            'status': 'active'
        }
        response = self.client.post(
            reverse('enrollment-create'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Enrollment.objects.filter(
            client=self.client_model,
            program=self.program
        ).exists())

    def test_enrollment_delete_view(self):
        new_enrollment = Enrollment.objects.create(
            client=self.client_model,
            program=self.program,
            status='active'
        )
        response = self.client.post(reverse('enrollment-delete', args=[new_enrollment.id]))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Enrollment.objects.filter(id=new_enrollment.id).exists())

    def test_enrollment_update_view(self):
        data = {
            'status': 'completed'
        }
        response = self.client.post(
            reverse('enrollment-update', args=[self.enrollment.id]),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.enrollment.refresh_from_db()
        self.assertEqual(self.enrollment.status, 'completed')

class DashboardTests(BaseTestCase):
    def test_dashboard_view(self):
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'dashboard.html')

        # Check context data
        self.assertTrue('total_clients' in response.context)
        self.assertTrue('active_programs' in response.context)
        self.assertTrue('active_enrollments' in response.context)
        self.assertTrue('completion_rate' in response.context)
        self.assertTrue('dropout_rate' in response.context)
        self.assertTrue('success_rate' in response.context)
        self.assertTrue('recent_enrollments' in response.context)
        self.assertTrue('gender_distribution' in response.context)
        self.assertTrue('program_distribution' in response.context)

    def test_dashboard_statistics(self):
        # Create additional test data
        ClientModel.objects.create(
            first_name='Test',
            last_name='Client',
            national_id='2222222222',
            gender='F',
            date_of_birth=datetime.now().date(),
            phone_number='2222222222',
            address='Test Address'
        )

        Program.objects.create(
            name='Inactive Program',
            description='Inactive Description',
            is_active=False
        )

        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)

        # Verify statistics
        self.assertEqual(response.context['total_clients'], 2)
        self.assertEqual(response.context['active_programs'], 1)
        self.assertEqual(response.context['active_enrollments'], 1)
