# 🐾 PawProtect — Product Requirements Document (PRD)

---

## 1. Project Overview

### 1.1 Product Description
PawProtect is an AI-powered, full-stack pet insurance management system designed to streamline insurance operations for both pet owners and insurance administrators. By integrating Google's Gemini AI model into key application workflows, PawProtect automates the manual, paper-intensive stages of insurance enrollment and provides an interactive pet health assistant, while supporting standard policy and claims processing.

### 1.2 The Problem It Solves
Traditional pet insurance management relies heavily on manual data entry and human review of veterinary medical charts to determine policy eligibility. This results in:
- High operational overhead and labor costs for insurance companies.
- High error rates and inconsistency in pre-existing condition assessments.
- Friction during pet registration when validating historical medical records.

PawProtect solves this by using generative AI to extract structured health data from veterinary PDFs, flag pre-existing conditions, and assess policy eligibility on registration.

### 1.3 Target Users
1. **Pet Owners**: Seeking a transparent, responsive platform to register pets, manage medical profiles, purchase insurance policies, and quickly submit claims.
2. **Insurance Administrators**: Back-office staff responsible for setting up insurance policies, reviewing claim submissions, and tracking platform metrics.

### 1.4 Goals and Success Metrics
- **Reducing Onboarding Friction**: Auto-populate pet registration fields and verify eligibility in under 30 seconds using medical document extraction.
- **Accurate Pre-Existing Condition Flagging**: Minimize human oversight by generating structured JSON profiles of chronic conditions.
- **System Reliability**: Maintain stateless horizontal scalability with an API Gateway layer protecting backend services via rate limiting.

---

## 2. Key Features

### 2.1 User Authentication & Profile Management
- **Description**: Secure registration, login, session persistence, and logout flow.
- **How it works**: Uses cookie-based stateless JWT auth. The backend issues a secure, HTTP-only, SameSite=Lax cookie containing user information.
- **Edge cases and limitations**: 
  - *SSR compatibility*: During server-side rendering, cookies must be forwarded programmatically from the incoming server request to the backend microservice.
  - *Fallback mechanism*: Supports a `Bearer` token header fallback for testing and integration.

### 2.2 AI-Powered Pet Registration & Eligibility Check
- **Description**: Users upload their pet's historical medical records in PDF format to register a pet with an immediate eligibility classification.
- **How it works**: The PDF text is extracted using `pypdf` on the FastAPI microservice, clean text is compiled and sent to Gemini (`gemini-2.0-flash`), which checks records against rules (e.g., maximum age limits, untreatable chronic conditions). The service returns a structured JSON payload mapping name, age, breed, pre-existing conditions, eligibility status (`ELIGIBLE`, `NOT_ELIGIBLE`, `PENDING`), and reason.
- **Edge cases and limitations**:
  - *Non-PDF records*: Only PDF text-extraction is natively supported.
  - *Under 10 characters*: Files containing less than 10 text characters are rejected by the document processor.

### 2.3 Insurance Plan Catalog & Comparison
- **Description**: Allows users to view and compare different insurance tiers, and admins to manage the plan availability.
- **How it works**: Plans are persisted with a JSON column containing specific coverage limits. The frontend renders dynamic comparison grids by unpacking the key-value structures.
- **Edge cases and limitations**:
  - Plans cannot be deleted if active policies refer to them. They must be toggled to `inactive` state.

### 2.4 Policy Enrollment and Lifecycle
- **Description**: Enables active policy subscription.
- **How it works**: Policy can only be purchased for an `ELIGIBLE` pet. Validates that the pet doesn't already have an active policy. Policies are auto-set for a duration of exactly one year.
- **Edge cases and limitations**:
  - Users cannot cancel a policy that has already expired or has pending claims under review.

### 2.5 Claim Submission
- **Description**: Users upload veterinary invoice files and submit claim details (treatment date, clinic name, diagnosis, treatment type, medications, and total amount) for reimbursement.
- **How it works**: Frontend uploads the receipt file along with the form data. The backend persists the claim and maps it to the associated active policy in a `PENDING` state for admin review.
- **Edge cases and limitations**:
  - Requires a valid invoice attachment to substantiate the claim amount.

### 2.6 Admin Review Dashboard
- **Description**: Allows admin to audit claims and adjust the approved payout.
- **How it works**: Displays claims by status. Allows approval or rejection with standard reasons. Upon approval, calculates payout after applying the plan's policy deductibles.
- **Edge cases and limitations**:
  - Deductible values must not exceed the total claim amount.

### 2.7 Multi-Context AI Chatbot
- **Description**: An interactive chat interface embedded in the dashboard layout.
- **How it works**: Passes a system instruction enforcing a "veterinary pet health assistant" persona. Users can optionally select a "pet context" which injects the pet's age, species, breed, and pre-existing medical conditions into the prompt context for personalized guidance.
- **Edge cases and limitations**:
  - Explicit guardrails in prompt prevent the AI from diagnosing conditions or prescribing medications.

---

## 3. Tech Stack

### 3.1 Backend Service
- **Java 17 / Spring Boot 4.0.0**: Used for robust type safety, dependency injection, and enterprise-grade REST architecture.
- **Spring Security & Spring Data JPA**: Standard framework modules for implementing JWT filters and object-relational mapping (Hibernate 6).
- **Lombok**: Reduces boilerplate code in Java models and DTOs.
- **JJWT (io.jsonwebtoken:0.11.5)**: Used for secure signing and parsing of HMAC-SHA JSON Web Tokens.

### 3.2 Frontend Application
- **Angular 21 (Server-Side Rendering)**: Chosen for fast initial loads, improved SEO via pre-rendered static assets, and modern client hydration.
- **NgRx Signal Store 21**: Light, reactive state management using Angular's native Signals APIs, replacing legacy Redux boilerplate.
- **Tailwind CSS 4.0**: Provides immediate utility-based glassmorphism styles and micro-animations.
- **Chart.js / ng2-charts**: Visualizes billing and claims metrics.

### 3.3 AI Service
- **Python 3.10 / FastAPI**: High-performance asynchronous endpoint definition and rapid development cycles for ML/AI wrappers.
- **Google Gen AI SDK (google-genai)**: The official SDK for interacting with Gemini (`gemini-2.0-flash`), supporting system instructions, temperature configurations, and response cleanups.
- **Pydantic v2**: Handles request validation and forces runtime typing on extracted JSON from LLM pipelines.

### 3.4 Infrastructure & Operations
- **Docker / Docker Compose**: Standardizes deployment environments into 6 isolated containers.
- **MySQL 8.0**: Relational database supporting advanced JSON columns for schema-free metadata storage (coverage items, pre-existing conditions).
- **Nginx**: Operates as a Reverse Proxy gateway implementing SSL/TLS termination and rate limiting.
- **GitHub Actions**: Automated CI/CD pushing images to GitHub Container Registry (GHCR) and deploying them to a DigitalOcean Droplet.

---

## 4. System Architecture

```
                          ┌─────────────────────────────────────────────────────────────┐
                          │              Docker Network (internal)                      │
                          │                                                             │
┌──────────┐   80/443     │  ┌───────────┐         ┌──────────────────┐                 │
│  Client  │ ─────────────┼─>│   Nginx   │ ─/api/─>│  Spring Boot     │                 │
│ (Browser)│              │  │  (Proxy)  │         │  Backend :8080   │                 │
└──────────┘              │  │  :80/:443 │         │  28 REST APIs    │──┐              │
                          │  │           │         └──────────────────┘  │              │
                          │  │           │                │              │              │
                          │  │           │ ────/──>┌──────────────────┐  │              │
                          │  │           │         │  Angular SSR     │  │              │
                          │  │           │         │  Frontend :4000  │  │              │
                          │  └───────────┘         └──────────────────┘  │              │
                          │       │                                      │              │
                          │       │    ┌──────────────────┐              │              │
                          │       │    │  FastAPI AI      │<─────────────┘              │
                          │       │    │  Service :8001   │              │              │
                          │       │    │  (Gemini API)    │              │              │
                          │       │    └──────────────────┘              │              │
                          │       │                                      │              │
                          │       │    ┌──────────────────┐              │              │
                          │       │    │  MySQL 8.0       │<─────────────┘              │
                          │       │    │  Database :3306  │                             │
                          │       │    └──────────────────┘                             │
                          └─────────────────────────────────────────────────────────────┘
```

### 4.1 Component Responsibilities
- **Nginx**: Serves as the SSL/TLS termination gateway. Automatically redirects HTTP (port 80) to HTTPS (port 443). Restricts API endpoint access to a rate limit of 5 requests/sec per IP (with a burst limit of 10 requests).
- **Angular SSR (petguard)**: Runs on Express. Supports rendering layouts on the server before client shipping. Hydrates inputs and handles client routing using `@angular/router`.
- **Spring Boot Backend (app)**: Serves as the central API orchestrator, managing MySQL database access, validating requests, verifying JWT signatures, and generating analytics data.
- **FastAPI Service (ai)**: Connects to the Google Gemini API. Offers internal analysis micro-utilities for eligibility checks and chat context. Excluded from public routing.
- **MySQL (mysqldb)**: Stores relational records. Configured with a persistent volume mapping to retain database states.

---

## 5. Data Models

### 5.1 Entity: User (`users` table)
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | Long | Primary Key, Auto-Increment | Unique identifier |
| `email` | String | Unique, Not Null | Account identifier |
| `password` | String | Not Null | BCrypt hashed password |
| `fullName` | String | Not Null | User profile name |
| `phone` | String | Nullable | User contact number |
| `role` | Enum | Not Null (`USER`, `ADMIN`) | Access authorization level |
| `createdAt` | LocalDateTime | Not Null | Date of registration |

### 5.2 Entity: Pet (`pets` table)
*Configured with Hibernate soft-delete capabilities.*
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | Long | Primary Key, Auto-Increment | Unique identifier |
| `name` | String | Not Null | Pet name |
| `species` | String | Not Null | Dog, Cat, etc. |
| `breed` | String | Nullable | Breed name |
| `age` | Integer | Nullable | Pet age in years |
| `gender` | String | Nullable | Male, Female, etc. |
| `photoUrl` | String | Nullable | Image reference URL |
| `medicalSummary` | Text | Nullable | Summarized historical health data |
| `preExistingConditionsJson`| Text (JSON) | Nullable | Parsed pre-existing conditions list |
| `eligibilityStatus` | Enum | Not Null | `ELIGIBLE`, `NOT_ELIGIBLE`, `PENDING` |
| `eligibilityReason` | Text | Nullable | Context for status decision |
| `eligibilityCheckedAt` | LocalDateTime | Nullable | Timestamp of execution |
| `user_id` | Long | Foreign Key | Owner association |

### 5.3 Entity: InsurancePlan (`insurance_plans` table)
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | Long | Primary Key, Auto-Increment | Unique identifier |
| `name` | String | Not Null | Plan tier name |
| `description` | Text | Nullable | Details of the plan |
| `monthlyPremium` | BigDecimal(10,2)| Not Null | Monthly subscription cost |
| `coverageLimit` | BigDecimal(10,2)| Not Null | Annual maximum payout |
| `deductible` | BigDecimal(10,2)| Not Null | Self-payout portion |
| `isPopular` | Boolean | Not Null (Default: `false`)| Flag for UI callouts |
| `coverageDetailsJson` | Text (JSON) | Nullable | List of coverage exceptions/inclusions |
| `isActive` | Boolean | Not Null (Default: `true`) | Active catalog flag |

### 5.4 Entity: Policy (`policies` table)
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | Long | Primary Key, Auto-Increment | Unique identifier |
| `pet_id` | Long | Foreign Key | Associated insured pet |
| `insurance_plan_id` | Long | Foreign Key | Subscribed plan details |
| `status` | Enum | Not Null | `ACTIVE`, `EXPIRED`, `CANCELLED` |
| `startDate` | LocalDate | Not Null | Policy activation date |
| `endDate` | LocalDate | Not Null | Policy termination date (1 year) |

### 5.5 Entity: Claim (`claims` table)
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | Long | Primary Key, Auto-Increment | Unique identifier |
| `policy_id` | Long | Foreign Key | Associated active policy |
| `treatmentDate` | LocalDate | Nullable | Date of veterinary care |
| `vetClinicName` | String | Nullable | Name of veterinarian facility |
| `diagnosis` | Text | Nullable | Medical diagnoses |
| `treatmentType` | String | Nullable | Outpatient, surgery, checkup |
| `medications` | Text | Nullable | Prescribed drugs |
| `claimAmount` | BigDecimal(10,2)| Not Null | Cost submitted |
| `approvedAmount` | BigDecimal(10,2)| Nullable | Reimbursement approved |
| `deductibleApplied` | BigDecimal(10,2)| Nullable | Value deducted from claim |
| `status` | Enum | Not Null | `PENDING`, `APPROVED`, `REJECTED`, `PROCESSING` |
| `decisionReason` | Text | Nullable | Notes explaining review |
| `reviewed_by_id` | Long | Foreign Key (Nullable) | Reviewing administrator |
| `reviewedAt` | LocalDateTime | Nullable | Review completion timestamp |

---

## 6. Business Logic

### 6.1 Pet Eligibility Determination Rules
1. **Age limits**: Pets above age threshold values (configured in prompts or properties) can be flagged `NOT_ELIGIBLE`.
2. **Pre-existing chronic disease detection**: If the AI detects conditions like terminal cancer or advanced stage kidney failure, the eligibility status is flagged as `NOT_ELIGIBLE` with reasons appended.
3. **Unclear documentation**: If document context is too sparse or missing diagnosis summaries, status transitions to `PENDING` for manual administrative oversight.

### 6.2 Policy Creation Constraints
- A pet must have the `ELIGIBLE` status to bind a policy.
- A pet can only have **one active policy** at any given time.
- The system prevents creation of new policies if an active plan is flagged as `inactive` in the database.

### 6.3 Claim Processing Rules
- **Policy Verification**: Claims must fall within the `startDate` and `endDate` boundaries of an active policy.
- **Status transitions**: A claim begins in `PENDING` and transitions to either `APPROVED` or `REJECTED` upon admin action.
- **Payout Math**:
  $$\text{Approved Amount} = \max\left(0, (\text{Claim Amount} - \text{Remaining Deductible}) \times \text{Reimbursement Ratio}\right)$$
  *(Where deductible values are tracked yearly per policy)*

---

## 7. API Reference

### 7.1 Authentication (`/api/v1/auth`)
- **`POST /register`**: Registers a new user. Returns user details.
- **`POST /login`**: Validates credentials. Sets `jwt` cookie on client.
- **`POST /logout`**: Clears authorization state and deletes the client cookie.
- **`GET /me`**: Returns profile data of the currently logged-in user.

### 7.2 Pet API (`/api/v1/pets`)
- **`POST /`**: Creates a pet profile manually.
- **`GET /`**: Lists pets owned by the authenticated caller.
- **`GET /{petId}`**: Returns specific pet by ID (enforces ownership).
- **`PUT /{petId}`**: Updates editable details of a pet.
- **`DELETE /{petId}`**: Performs soft-delete. Fails if active policy exists.

### 7.3 Insurance Plans (`/api/v1/plans`)
- **`GET /`**: Lists active plans. Optional parameters: `includeInactive`, `popularOnly`.
- **`POST /`** (Admin): Creates a new insurance plan tier.
- **`PUT /{id}`** (Admin): Modifies plan values.
- **`PATCH /{id}/status`** (Admin): Sets active status.

### 7.4 Policy API (`/api/v1/policies`)
- **`POST /`**: Binds a policy to a pet. Body: `{ petId, planId }`.
- **`GET /`**: Lists policies owned by current user.
- **`PATCH /{policyId}/cancel`**: Cancels active policy coverage.

### 7.5 Claim API (`/api/v1/claims`)
- **`POST /`**: Submits a claim (Supports Multipart file upload for receipts).
- **`GET /`**: Lists claims submitted by user.
- **`GET /all`** (Admin): Lists all system claims. Optional query: `status`.
- **`POST /{claimId}/review`** (Admin): Approves or rejects a claim.

---

## 8. User Flows

### 8.1 Onboarding and Registration Flow
```
[User Registration] -> [User Login] -> [Dashboard Home] 
                                            |
                                            v
                                 [Upload Vet PDF]
                                            |
                                            v
                               [FastAPI Extracts Text]
                                            |
                                            v
                              [Gemini Evaluates Eligibility]
                                            |
                         ┌──────────────────┴──────────────────┐
                         v                                     v
                  [Status: Eligible]                 [Status: Not Eligible]
                         |                                     |
                         v                                     v
                [Purchase Policy]                        [Flow Terminated]
```

### 8.2 Claim Submission Flow
1. User navigates to **Submit Claim** screen.
2. Selects active policy, enters treatment details (date, clinic, diagnosis, amount, medications), and uploads the receipt file.
3. Submits the form data and receipt file.
4. Administrative user reviews the record in the Admin Panel, selects Approve/Reject, and applies deductibles to calculate the final payout.

---

## 9. Folder Structure

```
pawprotect/
├── backend/                        # Java Spring Boot API service
│   ├── .mvn/                       # Maven wrapper configuration
│   ├── src/main/java/com/org/petGuard/
│   │   ├── core/                   # Security architecture, JWT filters, exceptions
│   │   └── domain/                 # Domain packages (claims, policies, users, pets)
│   ├── pom.xml                     # Spring Boot 4.0 dependency matrix
│   └── Dockerfile                  # JVM build file
│
├── petguard/                       # Angular SSR application
│   ├── src/app/
│   │   ├── core/                   # State stores, API interceptors, guards
│   │   └── features/               # Client page templates and layouts
│   ├── angular.json                # Angular deployment builds
│   └── Dockerfile                  # Node SSR build configuration
│
└── petguard-ai/                    # Python FastAPI AI Wrapper
    ├── app/
    │   ├── api/                    # Endpoint declarations
    │   ├── core/                   # Security and API environment configuration
    │   ├── schemas/                # Pydantic validation structures
    │   └── services/               # Gemini AI connections and prompt code
    ├── requirements.txt            # Python dependencies
    └── Dockerfile                  # Python runtime Docker file
```

---

## 10. Environment & Configuration

### 10.1 Key Environment Variables

| Variable | Target Service | Default | Description |
|---|---|---|---|
| `ROOT_PASSWORD` | Database | — | MySQL root account password |
| `DB_SCHEMA` | Database / Backend | `pawprotect` | MySQL database schema name |
| `DB_USER` | Database / Backend | `admin` | Application access user |
| `DB_PASSWORD` | Database / Backend | — | Password for the app user |
| `GEMINI_API_KEY` | AI Service | — | Google API Studio Access Key |
| `AI_API_KEY` | AI / Backend | — | Shared token for inter-service API key auth |
| `AI_SERVICE_URL` | Backend | `http://ai:8001` | FastAPI Docker networking endpoint |
| `AI_MODEL_NAME` | AI Service | `gemini-2.0-flash` | Selected Gemini deployment target |
| `JWT_SECRET` | Backend | — | HS256 JWT key (min 256-bit) |
| `ADMIN_EMAIL` | Backend | `admin@pawprotect.com`| Default seeded admin user login |
| `ADMIN_PASSWORD` | Backend | — | Default admin user password |
| `APP_FRONTEND_URL` | Backend / Proxy | `http://localhost` | Main client origin for CORS settings |

---

## 11. Known Issues & Limitations

1. **No Migration Engine**: Database schemas are auto-managed by Hibernate (`ddl-auto=update`). For production environments, this must be migrated to a structured tool like Flyway or Liquibase.
2. **Strict File Type Constraint**: Only PDF files are supported for eligibility checking. If users upload PNG/JPG medical record documents, the files will fail processing.

---

## 12. Future Roadmap

- **Automatic Claim Auto-Adjudication**: Introduce scoring rules for claims below a certain dollar threshold to automatically approve them without manual administrative intervention.
- **Stateful Chat Dialogues**: Integrate MongoDB or Redis backends to persist conversation histories between chatbot sessions.
- **Dynamic Pricing Algorithms**: Utilize ML analytics engines to scale monthly premium quotes dynamically based on pet risk factors and breed-specific tables.
- **Multimodal Document Upload**: Allow image uploads (JPEG/PNG) of pet records, parsing them directly using Gemini's vision capability.
