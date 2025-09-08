import { Injectable, inject } from '@angular/core';
import { DeltaAuth } from './delta-auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpRequests {
  private deltaAuth = inject(DeltaAuth);
  private http = inject(HttpClient)

  async authenticatedGetRequest(endpoint: string): Promise<string> {
    const token = await this.deltaAuth.getIdToken();

    return lastValueFrom(this.http.get(`${environment.server.url}/api/${endpoint}`, {
      headers: {
        "delta-auth": token.__raw
      },
      responseType: "text"
    }));
  }

  async authenticatedPostRequest(endpoint: string, body: any): Promise<string> {
    const token = await this.deltaAuth.getIdToken();

    return lastValueFrom(this.http.post(`${environment.server.url}/api/${endpoint}`, body, {
      headers: {
        "delta-auth": token.__raw
      },
      responseType: "text"
    }));
  }
}
