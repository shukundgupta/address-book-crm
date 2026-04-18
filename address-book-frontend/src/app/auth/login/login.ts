import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


/* ✅ MATERIAL SNACKBAR */
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  company_id: any = '';
  rememberMe = false;

  loading = false;

  /* ✅ DEFAULT LOGO */
  logoUrl = 'assets/app-logo.png';

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  /* =========================
     INIT
  ========================= */
  ngOnInit() {

    // ✅ Auto login if token exists
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }

    // ✅ Load remembered email and company
    const savedEmail = localStorage.getItem('remember_email');
    const savedCompany = localStorage.getItem('remember_company');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
    if (savedCompany) {
      this.company_id = savedCompany;
      this.onCompanyChange();
    }
  }

  /* =========================
     COMPANY CHANGE PREVIEW
  ========================= */
  onCompanyChange() {
    this.setCompanyLogo(Number(this.company_id));
  }

  /* =========================
     LOGIN
  ========================= */
  login() {

    if (!this.company_id) {
      this.showError('Please select a company');
      return;
    }

    if (!this.email || !this.password) {
      this.showError('Please enter email & password');
      return;
    }

    this.loading = true;

    this.auth.login({
      email: this.email,
      password: this.password,
      company_id: this.company_id
    }).subscribe({

      next: (res: any) => {

        // ✅ Save token
        this.auth.saveToken(res.token);
        this.auth.saveUser(res.user);
        this.router.navigate(['/dashboard']);
        
        // ✅ Save user (for header branding later)
        localStorage.setItem('user', JSON.stringify(res.user));

        // ✅ Remember email & company
        if (this.rememberMe) {
          localStorage.setItem('remember_email', this.email);
          localStorage.setItem('remember_company', this.company_id);
        } else {
          localStorage.removeItem('remember_email');
          localStorage.removeItem('remember_company');
        }

        // ✅ Dynamic logo based on company
        this.setCompanyLogo(res.user.company_id);

        this.loading = false;

        // ✅ Redirect
        this.router.navigate(['/dashboard']);
      },

      
      error: (err) => {

        this.loading = false;

        const msg = err?.error?.message || 'Login failed';
        this.showError(msg);
      }

      

    });

  }

  /* =========================
     SNACKBAR ERROR
  ========================= */
  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'error-snackbar'
    });
  }

  /* =========================
     COMPANY LOGO
  ========================= */
  setCompanyLogo(companyId: number) {

    if (companyId === 1) {
      this.logoUrl = 'assets/komal.jpg';
    } else if (companyId === 2) {
      this.logoUrl = 'assets/arnav.png';
    } else {
      this.logoUrl = 'assets/app-logo.png';
    }

  }

}