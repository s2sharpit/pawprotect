# 🐾 PawProtect - Pet Insurance AI Management System

PawProtect is a modern, full-stack pet insurance management application. It features a secure Spring Boot backend, a high-performance Angular SSR frontend, and an AI-powered service using Google's Gemini API for medical record analysis.

## 🚀 Tech Stack

- **Frontend:** Angular 19+ (SSR), Tailwind CSS
- **Backend:** Java 17, Spring Boot, Spring Security (JWT), Hibernate/JPA
- **AI Service:** Python 3.11+, FastAPI, Google Gen AI (Gemini Flash)
- **Database:** MySQL 8.0
- **Infrastructure:** Docker, Docker Compose, Nginx (Reverse Proxy & Rate Limiting)
- **CI/CD:** GitHub Actions (Deploying to DigitalOcean Droplet)

## 🛠️ Architecture

This project follows an **API Gateway Pattern**:
- **Nginx (Proxy):** Acts as the single entry point (Port 80). It routes `/api/` traffic to the backend and all other traffic to the Angular frontend. It also provides rate limiting for security.
- **Internal Network:** The database and AI services are hidden from the public internet and can only be accessed internally by the Spring Boot backend.

## 💻 Local Setup

### 1. Prerequisites
- Docker & Docker Compose installed on your machine.

### 2. Environment Configuration
Create a `.env` file in the root directory and add your credentials:

```bash
# Database
ROOT_PASSWORD=your_root_password
DB_SCHEMA=pawprotect
DB_USER=admin
DB_PASSWORD=admin_password

# AI Service (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key
AI_API_KEY=your_internal_secret_key
AI_MODEL_NAME=gemini-2.0-flash

# Security
JWT_SECRET=your_jwt_signing_secret
ADMIN_EMAIL=admin@pawprotect.com
ADMIN_PASSWORD=your_admin_password
```

### 3. Run the Application
Start the entire stack with a single command:
```bash
docker compose up --build
```
- **Frontend:** [http://localhost](http://localhost)
- **Backend API:** [http://localhost/api](http://localhost/api)
- **Health Checks:** [http://localhost/api/actuator/health](http://localhost/api/actuator/health)

## 🚢 Deployment

The project is configured for automated deployment to a **DigitalOcean Droplet** via GitHub Actions.

### Setup Deployment:
1.  Add your Droplet IP, SSH Key, and all `.env` variables as **GitHub Secrets**.
2.  Push your code to the `main` branch.
3.  GitHub Actions will SSH into your server, pull the latest code, and rebuild the containers automatically.

## 📄 License
This project is for demonstration purposes.
