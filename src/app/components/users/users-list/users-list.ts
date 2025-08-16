import { AfterViewInit, Component, inject, Injector, OnInit, runInInjectionContext, ViewChild } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Router, RouterLink } from "@angular/router";

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteConfirmationDialogComponent } from '../../delete-confirmation/delete-confirmation';
import { AppUser } from '../../../models/app-user';
import { AuthService } from '../../../services/auth';
import { Observable } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.sass'
})
export class UsersList implements OnInit, AfterViewInit {

  private dialog = inject(MatDialog);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);
  private usersCollection = collection(this.firestore, 'users');
  private users$ = collectionData(this.usersCollection, { idField: 'id' });
  private functions = inject(Functions);

  protected readonly loggedUser$: Observable<AppUser | null>;

  displayedColumns: string[] = ['name', 'is_admin', 'sectors', 'actions'];
  dataSource = new MatTableDataSource<AppUser>();
  isLoading = true;
  userIsAdmin = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authSvc: AuthService) {
    this.loggedUser$ = this.authSvc.user$;
  }

  ngOnInit(): void {
    this.users$.subscribe(users => {
      this.dataSource.data = users as AppUser[];
      this.loggedUser$.subscribe(user => {
        if (!user?.is_admin) {
          this.dataSource.filter = user!.uid ? user!.uid : '';
          this.userIsAdmin = false;
        } 
      });
      this.isLoading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editUser(user: AppUser): void {
    this.router.navigate([`/user/${user.id}`]);
  }

  deleteUser(user: AppUser): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { citizenName: user.is_admin },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        runInInjectionContext(this.injector, () => {
          const updateUser = httpsCallable(this.functions, 'delUser');
          updateUser({
            uid: user.id,
          }).then(()=>{
            this.snackBar.open('Usuário removido!', 'Fechar', { duration: 3000 });
          }).catch(error => {
            this.snackBar.open('Erro ao salvar dados!', 'Fechar', { duration: 3000 });
          });
        });
      }
    });
  }

}
