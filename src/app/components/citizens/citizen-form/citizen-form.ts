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
  selector: 'app-citizen-form',
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
  templateUrl: './citizen-form.html',
  styleUrl: './citizen-form.sass'
})
export class CitizenForm implements OnInit {
  private fb = inject(FormBuilder);
  private firestore: Firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private citizensCollection = collection(this.firestore, 'citizens');
  private citizenId: string | null = null;

  sectors = [
    { value: 'juridico', viewValue: 'Jurídico' },
    { value: 'psicologia', viewValue: 'Psicologia' },
    { value: 'assistencia', viewValue: 'Assistência Social' },
    { value: 'administrativo', viewValue: 'Administrativo' },
  ];

  citizenForm: FormGroup = this.fb.group({
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
    this.citizenId = this.route.snapshot.paramMap.get('id');
    if (this.citizenId) {
      this.loadCitizenData(this.citizenId);
    }
  }

  private async loadCitizenData(id: string): Promise<void> {
    const citizenDocRef = doc(this.firestore, 'citizens', id);
    const citizenDocSnap = await getDoc(citizenDocRef);

    if (citizenDocSnap.exists()) {
      this.citizenForm.patchValue(citizenDocSnap.data());
    } else {
      console.error(`Citizen with id ${id} not found.`);
      // Optionally navigate to a 'not-found' page or back to the list
      this.router.navigate(['/citizens']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.citizenForm.invalid) {
      return;
    }

    try {
      if (this.citizenId) {
        const citizenDocRef = doc(this.firestore, 'citizens', this.citizenId);
        await updateDoc(citizenDocRef, this.citizenForm.value);
      } else {
        await addDoc(this.citizensCollection, this.citizenForm.value);
      }
      this.router.navigate(['/citizens']); // Navigate to list after save/update
    } catch (error) {
      console.error('Error saving citizen data:', error);
    }
  }
}
