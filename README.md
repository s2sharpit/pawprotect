# 🐾 PawProtect — Pet Insurance AI Management System

PawProtect is a modern, full-stack pet insurance management platform. Pet owners can register pets, purchase insurance policies, and submit claims — with AI-powered medical document analysis automating eligibility assessments and receipt data extraction. Administrators get a complete management dashboard for policy oversight and claims adjudication.

---

## ✨ Features

### For Pet Owners
- **AI Eligibility Check** — Upload veterinary medical records (PDF); Gemini AI extracts pet details, medical history, pre-existing conditions, and determines insurance eligibility automatically
- **Policy Management** — Browse and compare insurance plans, subscribe to policies, and manage active coverage
- **AI-Powered Claim Submission** — Submit claims with receipt upload; AI extracts treatment details, diagnosis, medications, and amounts from veterinary bills
- **Pet Health Chatbot** — Context-aware AI assistant that answers pet health questions with pet-specific knowledge
- **Personal Dashboard** — View stats, active policies, recent claims, and activity at a glance

### For Administrators
- **Claims Review** — Approve or reject claims with deductible calculations and decision tracking
- **Insurance Plan Management** — Full CRUD for plans with coverage details, popularity flags, and active/inactive toggles
- **User Management** — View all users with their pets and policy details
- **Platform Analytics** — Global dashboard with KPIs: total users, active policies, claims by timeframe, approval rates, and revenue metrics

---

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Angular 21 (SSR), Angular Material, NgRx Signal Store, Tailwind CSS 4, Chart.js, Lucide Icons, TypeScript 5.9 |
| **Backend** | Java 17, Spring Boot 4, Spring Security (JWT), Spring Data JPA, Hibernate, Lombok, SpringDoc OpenAPI (Swagger UI) |
| **AI Service** | Python 3.10, FastAPI, Google Gen AI SDK (Gemini 2.0 Flash), Pydantic v2, pypdf |
| **Database** | MySQL 8.0 |
| **Infrastructure** | Docker & Docker Compose, Nginx (Reverse Proxy, Rate Limiting, TLS), Let's Encrypt / Certbot |
| **CI/CD** | GitHub Actions → GitHub Container Registry → DigitalOcean Droplet |

---

## 🛠️ Architecture

This project follows a **microservices architecture** with an **API Gateway pattern**:

```
                          ┌────────────────────────────────────────────────────┐
                          │              Docker Network (internal)             │
                          │                                                    │
┌──────────┐   80/443     │  ┌───────────┐         ┌──────────────────┐        │
│  Client  │ ─────────────┼─>│   Nginx   │ ─/api/─>│  Spring Boot     │        │
│ (Browser)│              │  │  (Proxy)  │         │  Backend :8080   │        │
└──────────┘              │  │  :80/:443 │         │  28 REST APIs    │──┐     │
                          │  │           │         └──────────────────┘  │     │
                          │  │           │                │              │     │
                          │  │           │         ┌──────────────────┐  │     │
                          │  │           │ ────/──>│  Angular SSR     │  │     │
                          │  │           │         │  Frontend :4000  │  │     │
                          │  └───────────┘         └──────────────────┘  │     │
                          │       │                                      │     │
                          │       │    ┌──────────────────┐              │     │
                          │       │    │  FastAPI AI      │<─────────────┘     │
                          │       │    │  Service :8001   │              │     │
                          │       │    │  (Gemini API)    │              │     │
                          │       │    └──────────────────┘              │     │
                          │       │                                      │     │
                          │       │    ┌──────────────────┐              │     │
                          │       │    │  MySQL 8.0       │<─────────────┘     │
                          │       │    │  Database :3306  │                    │
                          │       │    └──────────────────┘                    │
                          └────────────────────────────────────────────────────┘
```

- **Nginx** — Single public entry point. Routes `/api/` to backend, `/` to frontend. Provides rate limiting (5 req/s per IP) and TLS termination.
- **Spring Boot Backend** — Handles all business logic, JWT authentication, and orchestrates calls to the AI service.
- **Angular SSR Frontend** — Server-side rendered with Express, served on port 4000. Pre-renders the landing page; all other routes rendered on-demand.
- **FastAPI AI Service** — Internal-only microservice for Gemini API interactions. Secured with API key authentication. Not exposed publicly.
- **MySQL** — Persistent data store. Internal-only, accessible only by the backend.

---

## 📂 Project Structure

```
pawprotect/
├── backend/                        # Spring Boot REST API
│   ├── src/main/java/com/org/petGuard/
│   │   ├── core/
│   │   │   ├── config/             # CORS, RestTemplate, OpenAPI config
│   │   │   ├── exception/          # Global exception handler
│   │   │   └── security/           # JWT filter, auth entry point, SecurityConfig
│   │   └── domain/
│   │       ├── ai/                 # AI service integration (controller, service)
│   │       ├── auth/               # Registration, login, JWT token management
│   │       ├── claim/              # Claim entity, CRUD, admin review logic
│   │       ├── dashboard/          # User & admin analytics endpoints
│   │       ├── insurance/          # Insurance plan entity & management
│   │       ├── pet/                # Pet entity, CRUD, soft-delete
│   │       ├── policy/             # Policy entity, subscription, cancellation
│   │       └── user/               # User entity, admin user listing
│   ├── Dockerfile                  # Multi-stage: JDK 17 build → JRE 17 runtime
│   └── pom.xml
│
├── petguard/                       # Angular 21 SSR Frontend
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── constants/          # Centralized API endpoint URLs
│   │   │   ├── guards/             # Auth & admin route guards
│   │   │   ├── interceptors/       # Cookie-forwarding HTTP interceptor
│   │   │   ├── models/             # TypeScript interfaces
│   │   │   ├── services/           # API services (auth, pet, claim, plan, policy, ai, user)
│   │   │   └── store/              # NgRx Signal Stores (auth, pet)
│   │   ├── features/
│   │   │   ├── landing/            # Marketing landing page (pre-rendered)
│   │   │   ├── auth/               # Login & registration pages
│   │   │   ├── dashboard/          # User dashboard with 9 pages + AI chatbot
│   │   │   └── admin/              # Admin panel with dashboard, plans, claims, users
│   │   └── shared/                 # Shared components
│   ├── Dockerfile                  # Multi-stage: Node 20 build → Node 20 SSR runtime
│   └── package.json
│
├── petguard-ai/                    # FastAPI AI Microservice
│   ├── app/
│   │   ├── api/endpoints.py        # 5 AI endpoints (health, eligibility, receipts, chat)
│   │   ├── core/
│   │   │   ├── config.py           # Settings from environment variables
│   │   │   └── security.py         # API key authentication
│   │   ├── schemas/schemas.py      # Pydantic request/response models
│   │   └── services/
│   │       ├── ai_service.py       # Gemini API integration & prompt engineering
│   │       └── document_service.py # PDF text extraction via pypdf
│   ├── Dockerfile                  # Multi-stage: Python 3.10 build → slim runtime
│   └── requirements.txt
│
├── docs/                           # Sample PDFs & API documentation
├── .github/workflows/deploy.yml    # CI/CD pipeline (build → push → deploy)
├── docker-compose.yml              # 6-service orchestration
├── nginx.conf                      # Reverse proxy, rate limiting, TLS config
├── init-letsencrypt.sh             # Let's Encrypt certificate initialization
└── .env                            # Environment variables (gitignored)
```

---

## 🔌 API Overview

The backend exposes **28 REST endpoints** under `/api/v1`:

| Resource | Endpoints | Access |
|---|---|---|
| **Auth** (`/auth`) | Register, Login, Logout, Get Profile | Public / Authenticated |
| **Pets** (`/pets`) | Add, List, Get, Update, Delete (soft) | Authenticated (owner) |
| **Insurance Plans** (`/plans`) | List, Get, Create, Update, Toggle Status | Authenticated / Admin |
| **Policies** (`/policies`) | Subscribe, List, Get, Cancel | Authenticated (owner) |
| **Claims** (`/claims`) | Submit (with file upload), List, Get, List All, Review | Authenticated / Admin |
| **AI** (`/ai`) | Chat, Check Eligibility | Authenticated |
| **Dashboard** (`/dashboard`) | User Stats, Global Stats | Authenticated / Admin |

Full interactive API docs available at `/swagger-ui.html` when running locally.

---

## 💻 Local Setup

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine

### 1. Clone the Repository
```bash
git clone https://github.com/s2sharpit/pawprotect.git
cd pawprotect
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```bash
# Database
ROOT_PASSWORD=your_root_password
DB_SCHEMA=your_DB_SCHEMA
DB_USER=your_DB_USER
DB_PASSWORD=your_DB_PASSWORD

# AI Service (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key        # Get from https://aistudio.google.com/apikey
AI_API_KEY=your_internal_secret_key       # Any strong secret (shared between backend ↔ AI)
AI_SERVICE_URL=http://ai:8001             # Internal Docker service URL
AI_MODEL_NAME=your_AI_MODEL_NAME

# Security
JWT_SECRET=your_jwt_signing_secret        # Min 256-bit secret for HMAC-SHA
ADMIN_EMAIL=your_adming_email
ADMIN_PASSWORD=your_admin_password

# App
APP_FRONTEND_URL=http://localhost          # Used for CORS configuration
```

### 3. Run the Application
Start the entire stack with a single command:
```bash
docker compose up --build
```

Once all services are healthy:

| Service | URL |
|---|---|
| **Frontend** | [http://localhost](http://localhost) |
| **Backend API** | [http://localhost/api](http://localhost/api) |
| **API Docs (Swagger)** | [http://localhost/api/swagger-ui.html](http://localhost/api/swagger-ui.html) |
| **Health Check** | [http://localhost/api/actuator/health](http://localhost/api/actuator/health) |

> **Note:** The first build may take a few minutes as Docker downloads base images and installs dependencies. Subsequent starts will be much faster due to layer caching.

---

## 🚢 Deployment

The project uses a **two-stage CI/CD pipeline** via GitHub Actions, triggered on every push to `main`:

```
Push to main → Build Docker Images → Push to GHCR → SSH into Droplet → Pull & Restart
```

### Pipeline Details

1. **Build & Push** — Builds all service images and pushes them to GitHub Container Registry (`ghcr.io`)
2. **Deploy** — SSHs into the DigitalOcean Droplet, pulls the latest code, generates `.env` from GitHub Secrets, pulls pre-built images, and restarts containers

### Setup Deployment

1. Provision a **DigitalOcean Droplet** with Docker installed
2. Add the following **GitHub Secrets** to your repository:

   | Category | Secrets |
   |---|---|
   | **Server** | `DO_HOST`, `DO_USERNAME`, `DO_SSH_KEY`, `DO_SSH_PASSPHRASE` |
   | **Database** | `ROOT_PASSWORD`, `DB_SCHEMA`, `DB_USER`, `DB_PASSWORD` |
   | **AI** | `GEMINI_API_KEY`, `AI_API_KEY`, `AI_SERVICE_URL`, `AI_MODEL_NAME` |
   | **App** | `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `APP_FRONTEND_URL` |

3. Push to `main` — GitHub Actions handles the rest automatically

### SSL/TLS Setup (First-Time Only)
Run the initialization script to obtain Let's Encrypt certificates:
```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```
Certbot auto-renews certificates every 12 hours.

---

## 📄 License

This project is for demonstration purposes.
