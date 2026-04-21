import { Routes } from '@angular/router';

import { CrmLayoutComponent } from './layout/crm-layout';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerListComponent } from './customers/customer-list/customer-list';
import { CustomerForm } from './customers/customer-form/customer-form';
import { EmailCampaignComponent } from './email-campaign/email-campaign';

// ✅ Import Guard
import { authGuard } from './guards/auth.guard';

// ✅ Import Login Component
import { LoginComponent } from './auth/login/login';
import { Signup } from './auth/signup/signup';


export const routes: Routes = [

  /* PUBLIC ROUTES */
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: Signup },

  /* =========================
     PUBLIC ROUTE (NO LOGIN)
  ========================= */
  {
    path: 'login',
    component: LoginComponent
  },

  /* =========================
     PROTECTED ROUTES
  ========================= */
  {
    path: '',
    component: CrmLayoutComponent,
    // canActivate: [authGuard],   // 🔥 IMPORTANT (Temporarily Disabled for Debugging)
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'add-customer', component: CustomerForm },
      { path: 'email', component: EmailCampaignComponent }

    ]
  },

  /* =========================
     FALLBACK
  ========================= */
  {
    path: '**',
    redirectTo: 'login'
  }



];