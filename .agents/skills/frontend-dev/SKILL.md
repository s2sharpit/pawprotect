---
name: pawprotect-frontend-dev
description: Playbook for working with the Angular 19+ SSR and Tailwind CSS frontend of PawProtect. Activate this when creating/modifying components, editing pages, managing routing/guards, or updating styles.
---
# PawProtect Frontend Development Skill

This skill outlines the architecture, coding standards, and UI/UX design guidelines for the Angular 19+ (SSR) and Tailwind CSS frontend of PawProtect.

## 🎨 UI & UX Design Guidelines (Premium Aesthetics)
To ensure the app maintains a highly premium, modern aesthetic:
1. **Glassmorphism & Gradients:** Use soft gradients (e.g., indigo to violet) and blur backdrops (`backdrop-blur-md bg-white/10`) for panels and cards.
2. **Typography:** Rely on Outfit or Inter font families. Ensure hierarchical headings with varying weights.
3. **Micro-animations:** Incorporate hover transition effects on interactive items:
   ```html
   class="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
   ```
4. **Responsive Layouts:** Maintain mobile-first designs using Tailwind's breakpoint prefixes (`sm:`, `md:`, `lg:`).

---

## 📁 Frontend Structure
All code is located in the [app](file:///D:/Coding/projects/pawprotect/petguard/src/app) directory:
- `core/`: Application-wide singleton services, models, security interceptors, guards, and shared store:
  - `guards/`: Authorization guards (e.g., `auth.guard.ts`, `admin.guard.ts`).
  - `interceptors/`: HTTP interceptor to automatically inject JWT authentication headers.
  - `services/`: API client classes matching the backend controllers (e.g., `pet.service.ts`, `claim.service.ts`).
- `features/`: The main application views:
  - `landing/`: High-impact marketing pages.
  - `auth/`: Login and registration pages.
  - `dashboard/`: User panel for managing pets, submitting claims, and subscribing to policies.
  - `admin/`: Admin panels for managing insurance plans, reviewing claims, and managing users.
- `shared/`: Shared components (e.g., loading spinners, file uploaders, dialog modals, headers, and footers).

---

## 🛠️ Code Conventions & Best Practices

### Standalone Components
Angular 19 utilizes **standalone components** by default. Ensure new components use `imports: [...]` in their `@Component` decorator metadata rather than declaring them in a module.

### Handling Hydration & SSR
Because the application is configured with Server-Side Rendering (SSR), some browser APIs (like `window`, `document`, `localStorage`) will not be available when executing on the server.
- Protect browser-only code with `isPlatformBrowser`:
  ```typescript
  import { PLATFORM_ID, inject } from '@angular/core';
  import { isPlatformBrowser } from '@angular/common';

  private platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(this.platformId)) {
      // Safe to access window / localStorage
  }
  ```

---

## 🧪 Development & Build Commands
Run these commands in the `petguard/` directory:
- **Run local development server:**
  ```powershell
  npm run dev
  ```
- **Build for production:**
  ```powershell
  npm run build
  ```
- **Run tests:**
  ```powershell
  npm test
  ```
