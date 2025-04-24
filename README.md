# CEMA HEALTH SYSTEM

A Django-based backend system for managing clients and health programs/services. Built with modern best practices, containerized for scalability, and designed with clean architecture in mind.

## 🚀 Features

- ✅ Django 4.2.5 backend with RESTful API
- 🐳 Dockerized setup for production-ready deployments
- 🔐 JWT-based authentication system
- 🧬 Modular structure with reusable app components
- 📦 Environment-specific configurations (Dev & Prod)
- 🖥️ Gunicorn + Nginx for production serving
- 🧹 Code formatting and editor configurations
- 🔄 DRY and scalable folder structure
- 🌍 Internationalization support

## 📋 Prerequisites

- Python 3.x
- Docker and Docker Compose
- Node.js (for development tools)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/rickxy/cema-health-system.git
cd cema-health-system

```

2. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
cp .env.example .env  # Create your environment file
# Edit .env with your configuration
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
python manage.py runserver
```

### Production Mode with Docker

```bash
docker-compose up --build
```

## 🏗️ Project Structure

```
cema-health-system/
├── api/                     # DRF API views, serializers, routing
│   ├── v1/                  # Versioned API (optional, scalable)
│   │   ├── __init__.py
│   │   ├── urls.py          # API v1 routes
│   │   ├── views/           # DRF views for clients & programs
│   │   └── serializers/     # DRF serializers
│
├── apps/                    # Django apps
│   ├── clients/             # Client model, logic, admin
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── services.py      # (optional) business logic layer
│   │   └── tests.py
│   │
│   ├── programs/            # Health programs (e.g., TB, HIV)
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   └── tests.py
│   │
│   ├── dashboard/           # Custom analytics, dashboards
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── views.py
│   │   ├── models.py
│   │   └── tests.py
│   │
│   ├── visits/              # Patient visit records
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   └── tests.py
│   │
│   ├── logs/                # System audit logs
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── views.py
│   │   └── tests.py
│   │
│   └── helpers/             # Shared reusable logic
│       ├── __init__.py
│       └── audit_log.py     # Helper to log actions to AuditLog
│
├── auth/                    # Auth logic (JWT, social login, etc.)
│   ├── views.py
│   ├── serializers.py
│   └── permissions.py
│
├── config/                  # Settings loader, environment split
│   ├── __init__.py
│   ├── base.py              # Base settings
│   ├── dev.py               # Development settings
│   └── prod.py              # Production settings
│
├── locale/                  # Internationalization files (.po/.mo)
│   └── en/LC_MESSAGES/django.po
│
├── nginx/                   # Nginx configuration files
│   └── default.conf
│
├── src/                     # Optional for reusable logic, services
│   └── utils/               # Custom utilities/helpers
│       └── validators.py
│
├── templates/               # HTML templates (optional, if using Django views)
│   └── base.html
│
├── web_project/             # Django project root (settings, URLs)
│   ├── __init__.py
│   ├── settings.py          # Usually imports from config/
│   ├── urls.py
│   └── wsgi.py / asgi.py
│
├── .env                     # Local environment variables
├── .env.prod                # Production environment variables
├── docker-compose.yml       # Multi-container Docker orchestration
├── Dockerfile               # App Dockerfile
├── requirements.txt         # Python dependencies
└── README.md                # Project overview, setup, endpoints

```

## 🔧 Configuration

Use the .env file for local configuration, and .env.prod for production settings. Key variables include:

- `.env` - Development environment variables
- `.env.prod` - Production environment variables

## 🛡️ Security

- Environment variables for sensitive data
- Django security best practices enforced (e.g., SECURE_SSL_REDIRECT, CSRF_COOKIE_SECURE)
- Data access via authenticated APIs (JWT)
- Django security settings
- Production-ready configurations

## 📦 Dependencies

Main dependencies include:

- Django 4.2.5
- Gunicorn 21.2.0
- Python-dotenv 1.0.0
- Whitenoise 6.5.0

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Django community
- Open source contributors
- CEMA mentorship program
