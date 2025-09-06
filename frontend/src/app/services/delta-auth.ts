import { AuthService, IdToken } from '@auth0/auth0-angular';
import { BehaviorSubject, ReplaySubject, firstValueFrom } from 'rxjs';
import { DOCUMENT, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeltaAuth {
  idToken$: ReplaySubject<IdToken> = new ReplaySubject<IdToken>(1);
  uid$: ReplaySubject<string> = new ReplaySubject<string>(1);
  isAuthenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private auth = inject(AuthService);
  private document = inject(DOCUMENT);
  private http = inject(HttpClient)

  constructor() {
    this.auth.idTokenClaims$.subscribe((claims) => {
      if (claims) this.onConnect(claims);
    })
  }

  onConnect(claims: IdToken): void {
    this.http.get(`${environment.server.url}/api/auth/login`, {
      headers: {
        "delta-auth": claims.__raw
      },
      responseType: "text"
    })
      .subscribe({
        next: (response) => {
          this.succesfullLoginResponse(claims, response)
        },
        error: (error) => console.error(error)
      });
  }

  succesfullLoginResponse(claims: IdToken, response: string) {
    this.idToken$.next(claims);
    this.uid$.next(response);
    this.isAuthenticated$.next(true);
  }

  isAuthenticated() {
    return this.auth.isAuthenticated$;
  }

  login(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: this.document.location.origin } });
  }

  getIdToken(): Promise<IdToken> {
    return firstValueFrom(this.idToken$.asObservable());
  }

  getUid(): Promise<string> {
    return firstValueFrom(this.uid$.asObservable());
  }
}
