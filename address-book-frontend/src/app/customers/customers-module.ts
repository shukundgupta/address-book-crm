import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomerForm } from './customer-form/customer-form';
import { CustomerListComponent } from './customer-list/customer-list';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomerForm,
    CustomerListComponent
  ]
})
export class CustomersModule { }