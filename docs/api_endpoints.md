# PawProtect API Endpoints

This document outlines all the standard API endpoints available in the backend for the PawProtect platform, all structured under the RESTful `/api/v1/` prefix.

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Registers a new user account with the platform. |
| `POST` | `/login` | Authenticates a user and returns an access token for subsequent API calls. |

---

## 2. AI Assistant Endpoints (`/api/v1/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Interacts with the AI assistant for pet health advice. Payload can include `message` and optional `petId`. |
| `POST` | `/check-eligibility` | Uploads a medical record document to check the pet's eligibility. Expected input is `file` as form-data. |

*(Note: There may are also backend AI microservice mappings like `/health`, `/test`, `/receipt-extractions`, but they are abstracted or handled directly by the main backend.)*

---

## 3. Claims Endpoints (`/api/v1/claims`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Retrieves a list of all claims made by the currently authenticated user. |
| `POST` | `/` | Submits a new claim (FormData including claim details and receipt file). |
| `GET` | `/all` | Retrieves all claims across all users. Useful for Admins. Can include `?status=...` query to filter by claim status. |
| `GET` | `/{id}` | Retrieves the details of a specific claim by its ID. |
| `PUT` | `/{id}/review` | Updates or reviews the status/details of a specific claim. |
| `POST` | `/{id}/review` | Performs an Admin review on a claim, setting the status, reason, and an approved amount. |

---

## 4. Pets Profile Endpoints (`/api/v1/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Retrieves all registered pets for the currently authenticated user. |
| `POST` | `/` | Adds a new pet profile. |
| `GET` | `/{id}` | Retrieves detailed information of a specific pet by its ID. |
| `PUT` | `/{id}` | Updates details of an existing pet. |
| `DELETE`| `/{id}` | Deletes a pet profile. |

---

## 5. Insurance Plans Endpoints (`/api/v1/plans`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Retrieves active insurance plans. An optional `?includeInactive=true` query parameter returns all plans. |
| `POST` | `/` | Creates a new insurance plan (typically Admin only). |
| `GET` | `/{id}` | Retrieves details for a specific insurance plan. |
| `PUT` | `/{id}` | Updates an existing insurance plan's details. |
| `PATCH`| `/{id}/status` | Toggles the active/inactive status of the insurance plan. |

---

## 6. Policy Endpoints (`/api/v1/policies`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Retrieves all insurance policies belonging to the currently authenticated user. |
| `POST` | `/` | Subscribes a pet to an insurance plan (effectively creating a new policy). Payload expects `petId` and `planId`. |
| `PUT` | `/{id}/cancel`| Cancels a specific, currently active insurance policy by ID. |
