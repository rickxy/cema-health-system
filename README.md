# CEMA HEALTH SYSTEM

A Django-based backend application with modern development practices and Docker support.

## 🚀 Features

- Django 4.2.5 backend
- Docker containerization
- Gunicorn production server
- Nginx configuration
- Environment-based configuration
- Code formatting with Prettier
- Editor configuration support

## 📋 Prerequisites

- Python 3.x
- Docker and Docker Compose
- Node.js (for development tools)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd backend
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
backend/
├── api/            # API endpoints
├── apps/           # Django applications
├── auth/           # Authentication related code
├── config/         # Configuration files
├── locale/         # Internationalization files
├── nginx/          # Nginx configuration
├── src/            # Source files
├── templates/      # HTML templates
├── web_project/    # Main Django project settings
├── .env            # Environment variables
├── .env.prod       # Production environment variables
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## 🔧 Configuration

The project uses environment variables for configuration. Key files:

- `.env` - Development environment variables
- `.env.prod` - Production environment variables

## 🛡️ Security

- Environment variables for sensitive data
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
