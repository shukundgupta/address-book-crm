import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../customer';
import * as XLSX from 'xlsx';
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
     EXPORT (2 COLUMN FORMAT)
  ========================= */
  exportToExcel(): void {

    if (!this.customers.length) {
      alert('No data available');
      return;
    }

    let excelData: any[] = [];

    for (let i = 0; i < this.customers.length; i += 2) {

      const c1 = this.customers[i];
      const c2 = this.customers[i + 1];

      const buildBlock = (c: any) => {

        if (!c) return [];

        const addressLines = (c.address || '').split('\n');

        return [
          `Attn. ${c.title || 'Mr.'} ${c.contact_person || ''}`,
          `M/s. ${c.company_name || ''}`,
          ...addressLines,
          `${c.city || ''} ${c.pincode || ''}`,
          `Mobile : ${c.contact_number || ''}`,
          `Email : ${c.email || ''}`
        ];
      };

      const block1 = buildBlock(c1);
      const block2 = buildBlock(c2);

      const maxLines = Math.max(block1.length, block2.length);

      for (let j = 0; j < maxLines; j++) {
        excelData.push({
          A: block1[j] || '',
          B: block2[j] || ''
        });
      }

      // blank row between customers
      excelData.push({ A: '', B: '' });
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 45 },
      { wch: 45 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Manually trigger download to guarantee strictly preserved extension
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Customer_List.xlsx';
    
    // Required by many browsers to honor the download attribute
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Delay revocation to ensure the browser has time to initiate the download
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

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