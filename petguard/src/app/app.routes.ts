import { Routes } from '@angular/router';
import { LandingComponent } from '@features/landing/landing.component';
import { LoginComponent } from '@features/auth/login/login.component';
import { RegisterComponent } from '@features/auth/register/register.component';
import { DashboardLayoutComponent } from '@features/dashboard/dashboard-layout.component';
import { adminGuard, authGuard } from '@core/guards/auth.guard';
import { DashboardHomeComponent } from '@features/dashboard/dashboard-home/dashboard-home.component';
import { MyPetsComponent } from '@features/dashboard/my-pets/my-pets.component';
import { AddPet } from '@features/dashboard/add-pet/add-pet';
import { PetDetailsComponent } from '@features/dashboard/pet-details/pet-details.component';
import { EditPetComponent } from '@features/dashboard/edit-pet/edit-pet.component';
import { BrowsePlans } from '@features/dashboard/browse-plans/browse-plans';
import { MyPoliciesComponent } from '@features/dashboard/my-policies/my-policies.component';
import { MyClaimsComponent } from '@features/dashboard/my-claims/my-claims.component';
import { SubmitClaimComponent } from '@features/dashboard/submit-claim/submit-claim.component';
import { AdminDashboardComponent, AdminLayoutComponent } from '@features/admin/admin-layout.component';
import { ManagePlansComponent } from '@features/admin/manage-plans/manage-plans.component';
import { ReviewClaimsComponent } from '@features/admin/review-claims/review-claims.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'pets', component: MyPetsComponent },
      { path: 'pets/add', component: AddPet },
      { path: 'pets/:id', component: PetDetailsComponent },
      { path: 'pets/:id/edit', component: EditPetComponent },
      { path: 'plans', component: BrowsePlans },
      { path: 'policies', component: MyPoliciesComponent },
      { path: 'claims', component: MyClaimsComponent },
      { path: 'claims/submit', component: SubmitClaimComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'plans', component: ManagePlansComponent },
      { path: 'claims', component: ReviewClaimsComponent },
      // { path: 'users', component: ManageUsersComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
