import { AuthService, IdToken } from '@auth0/auth0-angular';
import { DOCUMENT, Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeltaAuth {
  username = "";
  private IdToken: IdToken | undefined;

  private auth = inject(AuthService);
  private document = inject(DOCUMENT);

  constructor() {
    this.auth.idTokenClaims$.subscribe((claims) => {
      if (claims) {
        this.IdToken = claims;
        this.onConnect();
      }
    })

    this.auth.user$.subscribe((user) => {
      if (user?.name) this.username = user.name;
    });
  }

  onConnect(): void {
    // TODO : try the token with sending a request to the backend
    if (this.IdToken) {
      console.log("Connected with ID Token:", this.IdToken);
    } else {
      console.log("No ID Token available.");
    }
  }

  isAuthenticated() {
    return this.auth.isAuthenticated$;
  }

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.document.location.origin } });
  }
}
