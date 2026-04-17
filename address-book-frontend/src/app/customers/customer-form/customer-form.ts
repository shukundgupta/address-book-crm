import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customer';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.css']
})
export class CustomerForm implements OnInit {

  customerForm: FormGroup;

  states: string[] = [];
  cities: string[] = [];

  isEdit = false;
  customerId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private service: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {

    this.customerForm = this.fb.group({
      title: ['Mr'],
      company_name: [''],
      customer_type: ['New'],
      address: [''],
      state: [''],
      city: [''],
      pincode: [''],
      email: [''],
      contact_person: [''],
      contact_number: ['']
    });

  }

  /* =========================
     INIT
  ========================= */
  ngOnInit(): void {

    /* EDIT MODE */
    this.route.queryParams.subscribe(params => {

      if (params['id']) {
        this.isEdit = true;
        this.customerId = +params['id'];
        this.loadCustomer(this.customerId);
      }

    });

    /* PINCODE AUTO FETCH */
    this.customerForm.get('pincode')?.valueChanges.subscribe((pincode: string) => {

      if (pincode && pincode.length === 6) {

        this.fetchPincodeData(pincode);

      } else {

        // reset dropdown if invalid pincode
        this.states = [];
        this.cities = [];

      }

    });

  }

  /* =========================
     PINCODE API
  ========================= */
  fetchPincodeData(pincode: string) {

    this.http.get(`https://api.postalpincode.in/pincode/${pincode}`)
      .subscribe({

        next: (res: any) => {

          console.log('API RESPONSE:', res);

          if (res && res.length > 0 && res[0].Status === 'Success') {

          const postOffices: any[] = res[0].PostOffice;

          /* UNIQUE STATES */
          this.states = [...new Set(postOffices.map(p => p.State))] as string[];

          /* UNIQUE CITIES */
          this.cities = [...new Set(postOffices.map(p => p.District))] as string[];

          /* AUTO FILL */
          if (!this.customerForm.value.state) {
            this.customerForm.patchValue({ state: this.states[0] });
          }

          if (!this.customerForm.value.city) {
            this.customerForm.patchValue({ city: this.cities[0] });
          }

        } else {
          this.states = [];
          this.cities = [];

            this.snackBar.open('Invalid Pincode', 'Close', {
              duration: 2000
            });

          }

        },

        error: () => {

          this.states = [];
          this.cities = [];

          this.snackBar.open('Error fetching pincode data', 'Close', {
            duration: 2000
          });

        }

      });

  }

  /* =========================
     LOAD CUSTOMER (EDIT)
  ========================= */
  loadCustomer(id: number) {

    this.loading = true;

    this.service.getAll().subscribe({

      next: (data: any[]) => {

        const customer = data.find(c => c.id == id);

        if (customer) {
          this.customerForm.patchValue(customer);
        }

        this.loading = false;

      },

      error: () => {

        this.loading = false;

        this.snackBar.open('Error loading customer', 'Close', {
          duration: 3000
        });

      }

    });

  }

  /* =========================
     SAVE / UPDATE
  ========================= */
  saveCustomer() {

    if (this.isEdit && this.customerId) {

      this.service.update(this.customerId, this.customerForm.value).subscribe(() => {

        this.snackBar.open('Customer updated successfully', 'Close', {
          duration: 3000
        });

        this.router.navigate(['/customers']);

      });

    } else {

      this.service.create(this.customerForm.value).subscribe(() => {

        this.snackBar.open('Customer saved successfully', 'Close', {
          duration: 3000
        });

        this.router.navigate(['/customers']);

      });

    }

  }

  /* =========================
     SUBMIT + DUPLICATE CHECK
  ========================= */
  onSubmit() {

    if (this.customerForm.invalid) return;

    const companyName = this.customerForm.value.company_name;

    this.loading = true;

    this.service.checkDuplicate(companyName).subscribe({

      next: (res: any) => {

        if (res.exists && !this.isEdit) {

          const confirmAdd = confirm(
            'This company already exists.\nDo you still want to add it?'
          );

          if (!confirmAdd) {
            this.loading = false;
            return;
          }

        }

        this.saveCustomer();

      },

      error: () => {
        this.loading = false;
      }

    });

  }

}