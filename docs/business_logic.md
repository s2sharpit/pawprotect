# PawProtect: Master Business Logic Documentation

This document serves as the comprehensive "Source of Truth" for all business rules, constraints, and automated workflows within the PawProtect platform.

---

## 1. User Authentication & Security

### Rule 1.1: Role-Based Access Control (RBAC)
- **USER Role**: Can manage own profile, pets, policies, and claims. Cannot see other users' data.
- **ADMIN Role**: Can manage all users, pets, policies, and claims. Can create/edit Insurance Plans and review claims.

### Rule 1.2: Data Ownership
- All entities (Pets, Policies, Claims) must be linked to a `User`.
- Every API request must validate that the `userId` in the context owns the requested resource, unless the requester is an `ADMIN`.

---

## 2. Pet Enrollment & Risk Assessment

### Rule 2.1: Inclusive Species Support
- Support for all common household pets (Dogs, Cats, Rabbits, Birds, etc.).

### Rule 2.2: Universal Age Enrollment
- No specific age limits for pets at the point of enrollment. Coverage is open to pets of all ages.

### Rule 2.3: AI-Driven Eligibility
- Users must upload a vet-signed medical summary or history.
- AI analyzes the document to identify:
    - **Confirmed Species/Breed**.
    - **Known Pre-existing Conditions**: These are flagged and *excluded* from future claim coverage.
- **Eligibility Statuses**:
    - `ELIGIBLE`: High confidence, no major chronic issues.
    - `PENDING`: Documentation is unclear; requires manual admin review.
    - `NOT_ELIGIBLE`: Severe chronic conditions identified that exceed coverage risk.

---

## 3. Insurance Plan Strategy

### Rule 3.1: Tiered Plan Structure
| Plan | Coverage Limit | Deductible | Key Features |
| :--- | :--- | :--- | :--- |
| **Basic** | $5,000 / year | $500 | Accidents only. |
| **Standard** | $10,000 / year | $250 | Accidents + Illness + Hereditary conditions. |
| **Premium** | Unlimited | $100 | Full coverage + Wellness rewards + Dental. |

### Rule 3.2: Standard Pricing
- Premiums are fixed based on the selected plan tier (Basic, Standard, Premium).
- No dynamic adjustments for age or breed at this time.

---

## 4. Policy Lifecycle Management

### Rule 4.1: Concurrent Policies
- A pet can have exactly **one active primary policy**.
- History must be preserved for all expired or cancelled policies.

### Rule 4.2: Policy Deletion & Pet Linkage
- A pet cannot be "removed" if a `PolicyStatus.ACTIVE` exists.
- *Refer to [Pet Lifecycle Section](#pet-lifecycle-soft-delete-only) for details.*

### Rule 4.3: Cancellations & Refunds
- **Pro-rated Refunds**: If a user cancels mid-billing cycle, they are refunded for the remaining days of that month (minus a $10 processing fee).
- **Grace Period**: Users have a 7-day grace period for missed premium payments before the policy is moved to `COOLDOWN` status (coverage paused).

---

## 5. Claims & Financial Logic

### Rule 5.1: Claim Submission Requirements
- Must include a digital receipt/invoice.
- Must be submitted within 90 days of the treatment date.
- Treatment date must fall within the `startDate` and `endDate` of an `ACTIVE` policy.

### Rule 5.2: AI-Automated Extraction
- AI extracts clinic name, treatment date, diagnosis, and total amount.
- If AI confidence is > 90%, the claim status moves to `PROCESSING`.

### Rule 5.3: Payout Calculation Formula
Payout = `(Approved_Amount - Deductible) × Reimbursement_Rate`.
- **Deductible Model**: Per-incident (applied individually to every unique diagnosis/incident).
- **Maximum Payout**: Limited by the annual `coverageLimit` defined in the pet's plan.

### Rule 5.4: Claim Status Workflow
1. `PENDING`: User submitted, waiting for AI extraction.
2. `PROCESSING`: Data extracted, waiting for manual review or auto-approval.
3. `APPROVED`: Payment issued to user.
4. `REJECTED`: Claim denied (e.g., pre-existing condition, expired policy). 

---

## 6. AI Integrity & Governance

### Rule 6.1: Auto-Approval Threshold
- Claims **under $100** with high AI confidence (> 95%) and no flagged pre-existing conditions can be **Auto-Approved**.
- ALL claims over $100 require manual review by an `ADMIN`.

### Rule 6.2: Human-in-the-Loop (HITL)
- Any discrepancy between the user's input and AI extraction triggers a "Manual Review Required" flag.
- Users can appeal any `REJECTED` claim, which triggers a mandatory second-level review by a senior admin.

---

## 7. Pet Lifecycle & Deletion (Archived Logic)

### Rule 7.1: Data Persistence (Soft Delete Only)
Pets should **never be permanently (hard) deleted** from the database if they have any historical association with a policy or a claim. 

### Rule 7.2: Deletion Restrictions
A pet **cannot be "removed" or "deactivated"** if it has an **ACTIVE** insurance policy. 
