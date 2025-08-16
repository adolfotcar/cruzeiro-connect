import { AfterViewInit, Component, inject, Injector, OnInit, runInInjectionContext, ViewChild } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, query, where } from '@angular/fire/firestore';
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
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { AppUser } from '../../../models/app-user';

interface Citizen {
  id?: string;
  name: string;
  surname: string;
  identity: string;
  cpf: string;
  sus: string;
  phone: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  monthly_income: number | null;
  profession: string;
  ethnicity: string;
  sector: string[];
}

@Component({
  selector: 'app-citizens-list',
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
  templateUrl: './citizens-list.html',
  styleUrl: './citizens-list.sass'
})
export class CitizenList implements OnInit, AfterViewInit {

  private dialog = inject(MatDialog);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);
  private citizensCollection = collection(this.firestore, 'citizens');
  private citizens$ = collectionData(this.citizensCollection, { idField: 'id' });
  private authSvc = inject(AuthService);
  protected readonly loggedUser$: Observable<AppUser | null> = this.authSvc.user$;

  displayedColumns: string[] = ['name', 'surname', 'cpf', 'phone', 'ethnicity', 'actions'];
  dataSource = new MatTableDataSource<Citizen>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    //if user belongs to a sector, then only shows the citizens that are in those sectors
    this.loggedUser$.subscribe((user: AppUser | null) => {
      if (user!.sectors?.length) {
        runInInjectionContext(this.injector, () => {
          const q = query(this.citizensCollection, where('sector', 'array-contains-any', user!.sectors));
          collectionData(q, { idField: 'id' }).subscribe(citizens => {
            this.dataSource.data = citizens as Citizen[];
          });
        });
      } 
      //if no sectors in the user profile then returns everyone
      else {
        this.citizens$.subscribe(citizens => {
          this.dataSource.data = citizens as Citizen[];
        });
      }
      this.isLoading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editCitizen(citizine: Citizen): void {
    this.router.navigate([`/citizen/${citizine.id}`]);
  }

  deleteCitizen(citizen: Citizen): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { citizenName: `${citizen.name} ${citizen.surname}` },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && citizen.id) {
        runInInjectionContext(this.injector, () => {
          const citizenDocRef = doc(this.firestore, `citizens/${citizen.id}`);
          deleteDoc(citizenDocRef).then(() => {
            this.snackBar.open('Cidadão removido com sucesso.', 'Fechar', { duration: 3000 });
          }).catch(error => {
            this.snackBar.open('Erro ao remover cidadão!', 'Fechar', { duration: 3000 });
          });
        });
      }
    });
  }

}
