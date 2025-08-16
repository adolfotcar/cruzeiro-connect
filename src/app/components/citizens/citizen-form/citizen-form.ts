import { Component, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ref,
  uploadBytes,
  deleteObject,
  listAll,
  getDownloadURL,
  Storage,
} from '@angular/fire/storage';

import { addDoc, collection, doc, getDoc, Firestore, updateDoc } from '@angular/fire/firestore';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

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
    MatListModule,
    RouterLink
  ],
  templateUrl: './citizen-form.html',
  styleUrl: './citizen-form.sass'
})
export class CitizenForm implements OnInit {
  private fb = inject(FormBuilder);
  private firestore: Firestore = inject(Firestore);
  private storage = inject(Storage);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);
  private citizensCollection = collection(this.firestore, 'citizens');
  
  public citizenId: string | null = null;
  public isLoading = true;
  public isSaving = false;
  public isUploading = false;

  public uploadedFiles: { name: string; url: string; fullPath: string }[] = [];

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

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.isUploading = true;
    const filesToUpload = Array.from(input.files);
    
    // Ensure we have a citizenId to create the correct path
    if (!this.citizenId) {
      this.isUploading = false;
      this.snackBar.open('Please save the citizen profile before uploading files.', 'Close', { duration: 5000 });
      return;
    }

    try {
      await Promise.all(filesToUpload.map(async (file) => {
        const filePath = `citizens/${this.citizenId}/files/${file.name}`;
        const fileRef = ref(this.storage, filePath);
        const uploadResult = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        this.uploadedFiles.push({
          name: file.name,
          url: downloadURL,
          fullPath: uploadResult.ref.fullPath,
        });
      }));

      this.snackBar.open('Files uploaded successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error uploading files.', 'Close', { duration: 3000 });
    } finally {
      this.isUploading = false;
    }
  }

  async removeFile(file: { name: string; url: string; fullPath: string }) {
    if (!this.citizenId) return;

    const fileRef = ref(this.storage, file.fullPath);
    try {
      await deleteObject(fileRef);
      this.uploadedFiles = this.uploadedFiles.filter((f) => f.fullPath !== file.fullPath);
      this.snackBar.open('File removed successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error removing file:', error);
      this.snackBar.open('Error removing file.', 'Close', { duration: 3000 });
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
