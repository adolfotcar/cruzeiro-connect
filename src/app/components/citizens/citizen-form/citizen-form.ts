import { Component, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { addDoc, collection, doc, getDoc, Firestore, updateDoc } from '@angular/fire/firestore';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
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
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);
  private citizensCollection = collection(this.firestore, 'citizens');
  private citizenId: string | null = null;

  isLoading = true;
  isSaving = false;

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
    } else {
      this.isLoading = false;
    }
  }

  private loadCitizenData(id: string){
    runInInjectionContext(this.injector, () => {
      const citizenDocRef = doc(this.firestore, 'citizens', id);    

      getDoc(citizenDocRef).then(docSnap => {
        console.log(docSnap.data());
        this.citizenForm.patchValue(docSnap.data()!);
        this.isLoading = false;
      }).catch(error => {
        console.error('Error loading citizen data:', error);
        this.router.navigate(['/citizens']);
      });
    });
  }

  onSubmit() {
    this.isSaving = true;
    if (this.citizenForm.invalid) {
      this.isSaving = false;
      return;
    }

    try {
      if (this.citizenId) {
        runInInjectionContext(this.injector, () => {
          const citizenDocRef = doc(this.firestore, 'citizens', this.citizenId!);
          updateDoc(citizenDocRef, this.citizenForm.value).then(() => {
            this.savedSuccess();
          }).catch(error => {
            this.savedError();
          });
        });
      } else {
        addDoc(this.citizensCollection, this.citizenForm.value).then(() => {
          this.savedSuccess();
        }).catch(error => {
          this.savedError();
        });
      }
    } catch (error) {
      this.savedError();  
    }
  }

  private savedSuccess(){
    this.snackBar.open('Cidadão salvo com sucesso!', 'Fechar', { duration: 3000 });
    this.router.navigate(['/citizens']);
  }

  private savedError(){
    this.isSaving = false;
    this.snackBar.open('Erro ao salvar dados!', 'Fechar', { duration: 3000 });
  }
}
