import { Injectable, inject } from '@angular/core';
import { DeltaAuth } from './delta-auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpRequests {
  // Service injections
  private deltaAuth = inject(DeltaAuth);
  private http = inject(HttpClient);

  private readonly url = `${environment.server.httpProtocol}${environment.server.domain}`;

  async authenticatedGetRequest<Out>(endpoint: string): Promise<Out> {
    const token = await this.deltaAuth.getIdToken();

    return await lastValueFrom(
      this.http.get<Out>(`${this.url}/api/${endpoint}`, { headers: { 'delta-auth': token.__raw } }),
    );
  }

  async authenticatedPostRequest<In, Out = unknown>(endpoint: string, body: In): Promise<Out> {
    const token = await this.deltaAuth.getIdToken();

    return await lastValueFrom(
      this.http.post<Out>(`${this.url}/api/${endpoint}`, body, { headers: { 'delta-auth': token.__raw } }),
    );
  }
}
