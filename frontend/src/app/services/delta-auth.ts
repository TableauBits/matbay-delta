import { AuthService, IdToken } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { DOCUMENT, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeltaAuth {
  private idToken$: ReplaySubject<IdToken> = new ReplaySubject<IdToken>(1);
  private uid$: ReplaySubject<string> = new ReplaySubject<string>(1);
  private isAuthenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Service injections
  private auth = inject(AuthService);
  private document = inject(DOCUMENT);
  private http = inject(HttpClient);

  constructor() {
    this.auth.idTokenClaims$.subscribe((claims) => {
      if (claims) this.onConnect(claims);
    });
  }

  private onConnect(claims: IdToken): void {
    const serverURL = `${environment.server.httpProtocol}${environment.server.domain}`;
    this.http
      .get(`${serverURL}/api/auth/login`, {
        headers: {
          'delta-auth': claims.__raw,
        },
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          this.succesfullLoginResponse(claims, response);
        },
        error: (error) => console.error(error),
      });
  }

  private succesfullLoginResponse(claims: IdToken, response: string): void {
    this.idToken$.next(claims);
    this.uid$.next(response);
    this.isAuthenticated$.next(true);
  }

  isAuthenticated(): Observable<boolean> {
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
