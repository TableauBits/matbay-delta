import { AuthService, IdToken } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { DOCUMENT, Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CallbackFunction, WsRequests } from './ws-requests';
import { WebsocketEvents } from '../../../../common/websocket';

@Injectable({
  providedIn: 'root'
})
export class DeltaAuth implements OnDestroy {
  private idToken$: ReplaySubject<IdToken> = new ReplaySubject<IdToken>(1);
  private uid$: ReplaySubject<string> = new ReplaySubject<string>(1);
  private isAuthenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private auth = inject(AuthService);
  private document = inject(DOCUMENT);
  private http = inject(HttpClient);
  private ws = inject(WsRequests);

  private eventListeners: Map<string, CallbackFunction>;

  constructor() {
    this.auth.idTokenClaims$.subscribe((claims) => {
      if (claims) this.onConnect(claims);
    });

    this.eventListeners = new Map([
      [WebsocketEvents.AUTH, this.onAuth],
    ]);
  }

  ngOnDestroy(): void {
    this.eventListeners.forEach((callback, event) => {
      this.ws.off(event, callback);
    });
  }

  onConnect(claims: IdToken): void {
    // Manage http login
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

    // Manage websocket login
    this.eventListeners.forEach((callback, event) => {
      this.ws.on(event, callback);
    });

    this.ws.emit(WebsocketEvents.AUTH, {token: claims.__raw});
  }

  onAuth(response: unknown): void {
    console.log(response);
  }

  succesfullLoginResponse(claims: IdToken, response: string): void {
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
