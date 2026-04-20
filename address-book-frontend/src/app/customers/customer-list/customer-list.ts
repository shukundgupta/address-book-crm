import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../customer';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.css']
})
export class CustomerListComponent implements OnInit {

  private searchSubject = new Subject<void>();
  customers: any[] = [];
  loading: boolean = false;

  filter = {
    company_name: '',
    state: '',
    city: '',
    pincode: '',
    customer_type: ''
  };

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  /* =========================
     INIT
  ========================= */
  ngOnInit(): void {
    this.loadCustomers();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.search());
  }

  /* =========================
     LOAD CUSTOMERS
  ========================= */
  loadCustomers(): void {

    this.loading = true;

    this.customerService.getAll().subscribe({
      next: (data: any[]) => {
        this.customers = data || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });

  }

  /* =========================
     FORMAT ADDRESS
  ========================= */
  formatAddress(c: any): string {

    const address = (c.address || '').replace(/\n/g, '<br>');

    return `
      ${address}<br>
      ${c.city || ''} ${c.pincode || ''}
    `;
  }

  /* =========================
     SEARCH
  ========================= */
search(): void {

  const hasFilter =
    this.filter.company_name ||
    this.filter.state ||
    this.filter.city ||
    this.filter.pincode ||
    this.filter.customer_type;

  // 🔥 If no filter → load all
  if (!hasFilter) {
    this.loadCustomers();
    return;
  }

  this.loading = true;

  this.customerService.search(this.filter).subscribe({
    next: (data: any[]) => {
      this.customers = data || [];
      this.loading = false;
      this.cd.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
    }
  });

}
  /* =========================
     AUTO SEARCH (LIVE)
  ========================= */
  onFilterChange(): void {
    this.searchSubject.next();
  }

  /* =========================
     CLEAR FILTER
  ========================= */
  clearFilter(): void {

    this.filter = {
      company_name: '',
      state: '',
      city: '',
      pincode: '',
      customer_type: ''
    };

    this.loadCustomers(); // 🔥 FIXED
  }

  /* =========================
     DELETE
  ========================= */
  deleteCustomer(id: number): void {

    if (!confirm('Delete this customer?')) return;

    this.customerService.delete(id).subscribe({
      next: () => {
        alert('Customer deleted');
        this.loadCustomers();
      },
      error: (err) => console.error(err)
    });

  }

  /* =========================
     EDIT
  ========================= */
  editCustomer(id: number): void {
    this.router.navigate(['/add-customer'], { queryParams: { id } });
  }

  /* =========================
     EXPORT — backend-driven download (.xlsx)
  ========================= */
  exportToExcel(): void {

    if (!this.customers.length) {
      alert('No data to export.');
      return;
    }

    // Opens backend export URL — browser downloads a proper .xlsx file
    const exportUrl = 'http://localhost:3000/api/customers/export';
    window.open(exportUrl, '_blank');

  }


   /* =========================
     RANDOM UI CARD COLOR
  ========================= */
  
  
 /* =========================
   COPY FULL CARD
========================= */
  copyFullCustomer(c: any) {

    const address = (c.address || '').replace(/\n/g, '\n');

    const text = `
  Attn. ${c.title || 'Mr.'} ${c.contact_person || ''}
  M/s. ${c.company_name || ''}
  ${address}
  ${c.city || ''} ${c.pincode || ''}
  Mobile : ${c.contact_number || ''}
  Email : ${c.email || ''}
  `;

    navigator.clipboard.writeText(text.trim());

    alert('Customer details copied');
  }


}