import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customers/customer';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats = {
    total: 0,
    new: 0,
    existing: 0
  };

  constructor(private customerService: CustomerService,
  private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadStats();
  }

  goToAddCustomer() {
  this.router.navigate(['/add-customer']);
  }

  loadStats() {

    this.customerService.getStats().subscribe((res: any) => {

      this.stats.total = res.total;
      this.stats.new = res.new_count;
      this.stats.existing = res.existing_count;
      this.cdr.detectChanges(); // 🔥 FORCE UI UPDATE
    });

  }

}