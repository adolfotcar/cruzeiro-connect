import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { addDoc, collection, doc, getDoc, Firestore, updateDoc } from '@angular/fire/firestore';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-customer-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.sass'
})
export class CustomerForm implements OnInit {
  private fb = inject(FormBuilder);
  private firestore: Firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private customersCollection = collection(this.firestore, 'customers');
  private customerId: string | null = null;

  sectors = [
    { value: 'juridico', viewValue: 'Jurídico' },
    { value: 'psicologia', viewValue: 'Psicologia' },
    { value: 'assistencia', viewValue: 'Assistência Social' },
    { value: 'administrativo', viewValue: 'Administrativo' },
  ];

  customerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    surname: ['', Validators.required],
    identity: [''],
    cpf: ['', Validators.required],
    sus: [''],
    phone: ['', Validators.required],
    address1: [''],
    address2: [''],
    address3: [''],
    address4: [''],
    monthly_income: [null, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
    profession: [''],
    ethnicity: [''],
    sector: [[], Validators.required]
  });

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.loadCustomerData(this.customerId);
    }
  }

  private async loadCustomerData(id: string): Promise<void> {
    const customerDocRef = doc(this.firestore, 'customers', id);
    const customerDocSnap = await getDoc(customerDocRef);

    if (customerDocSnap.exists()) {
      this.customerForm.patchValue(customerDocSnap.data());
    } else {
      console.error(`Customer with id ${id} not found.`);
      // Optionally navigate to a 'not-found' page or back to the list
      this.router.navigate(['/customers']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.customerForm.invalid) {
      return;
    }

    try {
      if (this.customerId) {
        const customerDocRef = doc(this.firestore, 'customers', this.customerId);
        await updateDoc(customerDocRef, this.customerForm.value);
      } else {
        await addDoc(this.customersCollection, this.customerForm.value);
      }
      this.router.navigate(['/customers']); // Navigate to list after save/update
    } catch (error) {
      console.error('Error saving customer data:', error);
    }
  }
}
