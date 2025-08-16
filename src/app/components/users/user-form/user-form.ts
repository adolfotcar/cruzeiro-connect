import { Component, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { doc, getDoc, Firestore, updateDoc, setDoc } from '@angular/fire/firestore';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { Auth, createUserWithEmailAndPassword, updatePassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AppUser } from '../../../models/app-user';
import { AuthService } from '../../../services/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const passwordConfirmation = control.get('password_confirmation');

  return password && passwordConfirmation && password.value !== passwordConfirmation.value
    ? { passwordMismatch: true }
    : null;
};
@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    RouterLink
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.sass'
})
export class UserForm implements OnInit{

  private fb = inject(FormBuilder);
  private firestore: Firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);
  private functions = inject(Functions);

  protected readonly loggedUser$: Observable<AppUser | null>;

  public userId: string | null = null;
  isLoading = true;
  isSaving = false;

  sectors = [
    { value: 'juridico', viewValue: 'Jurídico' },
    { value: 'psicologia', viewValue: 'Psicologia' },
    { value: 'assistencia', viewValue: 'Assistência Social' },
    { value: 'administrativo', viewValue: 'Administrativo' },
  ];

  userForm: FormGroup = this.fb.group({
    email_address: {value: '', disabled: this.route.snapshot.paramMap.get('id')!=null},
    name: [''],
    is_admin: [false],
    sectors: [[]],
    password: [''],
    password_confirmation: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    password: [''],
    password_confirmation: ['']
  }, { validators: passwordMatchValidator });

  constructor(private authSvc: AuthService) {
      this.loggedUser$ = this.authSvc.user$;
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserData(this.userId);
    } else {
      this.isLoading = false;
    }
  }

  private loadUserData(id: string){
    runInInjectionContext(this.injector, () => {
      const userDocRef = doc(this.firestore, 'users', id);    

      getDoc(userDocRef).then(docSnap => {
        this.userForm.patchValue(docSnap.data()!);
        this.isLoading = false;
      }).catch(error => {
        console.error('Error loading user data:', error);
        this.router.navigate(['/users']);
      });
    });
  }

  onSubmit(){
    this.isSaving = true;

    if (this.userId){
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(){
    const addUser = httpsCallable(this.functions, 'addUser');
    addUser({
      email: this.userForm.value.email_address,
      password: this.userForm.value.password,
      name: this.userForm.value.name,
      is_admin: this.userForm.value.is_admin,
      sectors: this.userForm.value.sectors
    }).then(()=>{
      this.savedSuccess();
    }).catch(error => {
      this.savedError();
    });
  }

  updateUser(){
    runInInjectionContext(this.injector, () => {
      const updateUser = httpsCallable(this.functions, 'updateUser');
      updateUser({
        uid: this.userId,
        email: this.userForm.value.email_address,
        name: this.userForm.value.name,
        is_admin: this.userForm.value.is_admin,
        sectors: this.userForm.value.sectors
      }).then(()=>{
        this.savedSuccess();
      }).catch(error => {
        this.savedError();
      });
    });
  }

  updatePassword(){
    runInInjectionContext(this.injector, () => {
      const updateUser = httpsCallable(this.functions, 'changePassword');
      updateUser({
        uid: this.userId,
        password: this.passwordForm.value.password
      }).then(()=>{
        this.savedSuccess();
      }).catch(error => {
        this.savedError();
      });
    });
  }

  private savedSuccess(message: string = 'Usuário salvo com sucesso!'){
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
    this.router.navigate(['/users']);
  }

  private savedError(message: string = 'Erro ao salvar dados!'){
    this.isSaving = false;
    this.snackBar.open('Erro ao salvar dados!', 'Fechar', { duration: 3000 });
  }

}
