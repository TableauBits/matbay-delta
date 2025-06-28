import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { AuthService, IdToken } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class DeltaAuth {
  username = "";
  private IdToken: IdToken | undefined;

  constructor(@Inject(DOCUMENT) private document: Document,  private auth: AuthService) {
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
