import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crm-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './crm-layout.html',
  styleUrls: ['./crm-layout.css']
})
export class CrmLayoutComponent implements OnInit {

  companyLogo = 'assets/default-logo.jpg';
  companyName = 'MyCRM';
  userEmail = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {

    const user = this.auth.getUser();

    if (user) {
      this.companyName = user.company_name || 'MyCRM';
      this.userEmail = user.email || '';

      this.companyLogo = user.company_logo
        ? 'assets/' + user.company_logo
        : 'assets/default-logo.jpg';
    }

  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}