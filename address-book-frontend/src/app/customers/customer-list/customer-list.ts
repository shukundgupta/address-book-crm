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

  // Pagination
  currentPage: number = 1;
  pageSize: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  filter = {
    company_name: '',
    state: '',
    city: '',
    pincode: '',
    customer_type: '',
    tags: ''
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
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1; // Reset to page 1 on filter change
      this.search();
    });
  }

  /* =========================
     LOAD CUSTOMERS
  ========================= */
  loadCustomers(): void {

    this.loading = true;

    this.customerService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.customers = res.data || [];
        this.totalItems = res.total || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
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
    this.filter.customer_type ||
    this.filter.tags;

  // 🔥 If no filter → load all
  if (!hasFilter) {
    this.loadCustomers();
    return;
  }

  this.loading = true;

  this.customerService.search(this.filter, this.currentPage, this.pageSize).subscribe({
    next: (res: any) => {
      this.customers = res.data || [];
      this.totalItems = res.total || 0;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
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
     PAGINATION CONTROLS
  ========================= */
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.search(); // This will handle both filtered and unfiltered cases via search() logic
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.search();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.search();
    }
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
      customer_type: '',
      tags: ''
    };

    this.currentPage = 1; // 🔥 Reset to first page
    this.loadCustomers(); 
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