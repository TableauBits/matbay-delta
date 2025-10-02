import { Injectable, inject } from '@angular/core';
import { DeltaAuth } from './delta-auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpRequests {
  // Service injections
  private deltaAuth = inject(DeltaAuth);
  private http = inject(HttpClient)

  private readonly url = `${environment.server.httpProtocol}${environment.server.domain}`

  async authenticatedGetRequest(endpoint: string): Promise<string> {
    const token = await this.deltaAuth.getIdToken();

    return lastValueFrom(this.http.get(`${this.url}/api/${endpoint}`, {
      headers: {
        "delta-auth": token.__raw
      },
      responseType: "text"
    }));
  }

  async authenticatedPostRequest(endpoint: string, body: unknown): Promise<string> {
    const token = await this.deltaAuth.getIdToken();

    return lastValueFrom(this.http.post(`${this.url}/api/${endpoint}`, body, {
      headers: {
        "delta-auth": token.__raw
      },
      responseType: "text"
    }));
  }
}
