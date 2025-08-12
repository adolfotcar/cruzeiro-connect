import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private injector: Injector = inject(Injector);
  public readonly user$: Observable<User | null>;
  
  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
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