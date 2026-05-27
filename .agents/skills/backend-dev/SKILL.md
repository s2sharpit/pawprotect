---
name: pawprotect-backend-dev
description: Playbook for developing and maintaining the Java 17 / Spring Boot backend of PawProtect. Activate this when adding new REST endpoints, modifying entities, updating business rule validations, or tuning Spring Security filters.
---
# PawProtect Backend Development Skill

This skill outlines the architecture, coding standards, and business rules for the Java 17 / Spring Boot backend of PawProtect.

## 🚀 Backend Tech Stack
- **Framework:** Spring Boot 3.x, Spring Web, Spring Security (JWT-based token authentication)
- **Data Access:** Spring Data JPA, Hibernate 6.x (MySQL 8.0)
- **Utilities:** Lombok (getters/setters/builders/constructors)
- **Build Tool:** Maven (mvnw)

---

## 📁 Package & Component Structure
The backend is structured by feature inside `com.org.petGuard` (located in [java](file:///D:/Coding/projects/pawprotect/backend/src/main/java/com/org/petGuard)):
- `core/`: Global cross-cutting concerns:
  - `config/`: Security, App configurations.
  - `exception/`: Global Exception Handler and custom exception types.
  - `security/`: JWT token parsing, user principal context, filters, and encoder setups.
- `domain/`: Domain models and business logic organized by resource feature (e.g., `user`, `pet`, `policy`, `claim`, `insurance`, `ai`):
  - Each feature package typically contains:
    - **`Entity.java`**: The database-mapped JPA entity class.
    - **`Repository.java`**: Spring Data repository interface.
    - **`Service.java`**: `@Service` class implementing transactional business logic.
    - **`Controller.java`**: `@RestController` mapped to `@RequestMapping("/api/v1/...")`.
    - **`Request.java`/`Response.java`**: Plain DTOs to encapsulate API request/response payloads.

---

## 🔒 Security & Access Control Playbook

### Rule 1: Role-Based Access Control (RBAC)
- **`ROLE_USER`**: Can view/edit their own resources (pets, claims, policies). Must never access data belonging to other users.
- **`ROLE_ADMIN`**: Can review all claims, modify insurance plan parameters, view all platform users, and override statuses.
- Use Spring Security annotations or inline security checks to enforce these boundaries.

### Rule 2: Multi-tenant Data Ownership
- All entities (Pets, Policies, Claims) are implicitly linked back to a `User` entity.
- Always validate that the currently authenticated user's ID matches the owner of the resource being fetched or updated:
  ```java
  if (!entity.getUser().getId().equals(currentUserId) && !currentUser.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized access to resource");
  }
  ```

---

## 💾 JPA & Hibernate Guidelines

### Soft Deletes (`Rule 7.1` & `Rule 7.2`)
- Pets must **never** be permanently deleted if they have any policy history or claims.
- The `Pet` entity uses `@SoftDelete` (Hibernate annotation).
- Before invoking soft deletion via `petRepository.delete(pet)`, verify the pet does not have an active policy:
  ```java
  boolean hasActivePolicy = policyRepository.existsByPetIdAndStatus(petId, Policy.PolicyStatus.ACTIVE);
  if (hasActivePolicy) {
      throw new IllegalStateException("Cannot delete pet with an active policy.");
  }
  ```

### Bidirectional Mappings & Lombok
- To avoid stack overflows during JSON serialization or `toString()` calls, always include `@ToString.Exclude` and `@EqualsAndHashCode.Exclude` on bidirectional relationships (e.g., `@OneToMany` lists or `@ManyToOne` references to parent objects).

---

## 🧪 Maven Commands
Run these commands in the `backend/` directory:
- **Clean and Package (Build JAR):**
  ```powershell
  ./mvnw clean package -DskipTests
  ```
- **Run Spring Boot locally:**
  ```powershell
  ./mvnw spring-boot:run
  ```
