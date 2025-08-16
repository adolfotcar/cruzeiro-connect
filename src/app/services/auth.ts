import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword } from '@angular/fire/auth';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AppUser } from '../models/app-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private firestore: Firestore = inject(Firestore);
  private injector = inject(Injector);

  public readonly user$: Observable<AppUser | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          return runInInjectionContext(this.injector, () => {
            const userDocRef = doc(this.firestore, `users/${user.uid}`);
            return docData(userDocRef).pipe(
              map(firestoreUser => {
                return { ...user, ...firestoreUser } as AppUser;
              })
            );
          }); 
        } else {
          return of(null);
        }
      })
    );
  }

  public signIn(email: string, password: string){
    return runInInjectionContext(this.injector, () => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  public signOut(): Promise<void> {
    return this.auth.signOut();
  }
}