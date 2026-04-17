import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {

  name = '';
  email = '';
  password = '';
  company_id: any = '';

  otp: string[] = ['', '', '', '', '', ''];
  otpSent = false;
  otpVerified = false;

  timer = 0;
  interval: any;

  loading = false;

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  /* ================= OTP SEND ================= */
  sendOtp() {

  if (!this.company_id) {
    this.snack.open('Select company first', 'OK', { duration: 2000 });
    return;
  }

  if (!this.email) {
    this.snack.open('Enter email first', 'OK', { duration: 2000 });
    return;
  }

  this.loading = true;
  this.http.post('http://localhost:3000/api/auth/send-otp', {
    email: this.email,
    company_id: this.company_id
  }).subscribe({

    next: () => {
      this.loading = false;
      // ✅ FINAL FIX (NO ERROR EVER AGAIN)
      this.zone.run(() => {
        this.otpSent = true;
        this.startTimer();
      });
      this.cdr.detectChanges();

      this.snack.open('OTP sent to email', 'OK', { duration: 2000 });
    },

    error: (err: any) => {
      this.loading = false;
      const msg = err?.error?.message || 'Failed to send OTP';
      this.snack.open(msg, 'OK', { duration: 3000 });
    }

  });
}

  /* ================= OTP INPUT (FINAL STABLE) ================= */
  onOtpKeyDown(event: KeyboardEvent, index: number) {

    const input = event.target as HTMLInputElement;
    const key = event.key;

    // Allow only numbers
    if (/^[0-9]$/.test(key)) {

      event.preventDefault();

      this.otp[index] = key;
      input.value = key;

      setTimeout(() => {
        if (index < 5) {
          const next = input.parentElement?.children[index + 1] as HTMLInputElement;
          next?.focus();
        }
      }, 0);

      return;
    }

    // Backspace
    if (key === 'Backspace') {

      event.preventDefault();

      this.otp[index] = '';
      input.value = '';

      setTimeout(() => {
        if (index > 0) {
          const prev = input.parentElement?.children[index - 1] as HTMLInputElement;
          prev?.focus();
        }
      }, 0);

      return;
    }

    // Block others
    event.preventDefault();
  }

  /* ================= TIMER ================= */
  startTimer() {
    this.timer = 60;
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;
      this.cdr.detectChanges();
      if (this.timer <= 0) clearInterval(this.interval);
    }, 1000);
  }

  /* ================= VERIFY OTP ================= */
  verifyOtp() {

    const fullOtp = this.otp.join('');

    if (fullOtp.length !== 6) {
      this.snack.open('Enter complete OTP', 'OK', { duration: 2000 });
      return;
    }

    this.loading = true;
    this.http.post('http://localhost:3000/api/auth/verify-otp', {
      email: this.email,
      otp: fullOtp
    }).subscribe({

      next: () => {
        this.otpVerified = true;
        this.snack.open('OTP Verified', 'OK', { duration: 2000 });
        this.register();
      },

      error: () => {
        this.loading = false;
        this.snack.open('Invalid or expired OTP', 'OK', { duration: 2000 });
      }

    });
  }

  /* ================= REGISTER & LOGIN ================= */
  register() {

    // Removed otpVerified checks since verifyOtp naturally chains here 

    this.http.post('http://localhost:3000/api/auth/register', {
      name: this.name,
      email: this.email,
      password: this.password,
      company_id: this.company_id
    }).subscribe({

      next: () => {
        // Automatically perform login instead of navigating to /login
        this.auth.login({
          email: this.email,
          password: this.password
        }).subscribe({
          next: (res: any) => {
            this.auth.saveToken(res.token);
            this.auth.saveUser(res.user);
            this.loading = false;
            this.snack.open('Welcome to AddressBook CRM!', 'OK', { duration: 2000 });
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.loading = false;
            this.snack.open('Registration successful, please login.', 'OK', { duration: 3000 });
            this.router.navigate(['/login']);
          }
        });
      },

      error: () => {
        this.loading = false;
        this.snack.open('Signup failed', 'OK', { duration: 2000 });
      }

    });
  }

}