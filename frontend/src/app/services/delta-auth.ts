import { AuthService, IdToken } from '@auth0/auth0-angular';
import { DOCUMENT, Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeltaAuth {
  username = "";
  private IdToken: IdToken | undefined;

  private auth = inject(AuthService);
  private document = inject(DOCUMENT);
  private http = inject(HttpClient)

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

    console.log(environment.name, "environment loaded");
  }

  onConnect(): void {
    if (this.IdToken) {
      this.http.get("http://localhost:3000/dev/auth/check", {
        headers: {
          "delta-auth": this.IdToken.__raw
        }
      })
      .subscribe({
        next: (response) => {
          console.log("Authentication check response:", response);
        },
        error: (error) => {
          console.error("Authentication check error:", error);
        }
      });
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
