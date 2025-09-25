import { inject, Injectable } from '@angular/core';
import { HttpRequests } from './http-requests';
import { Constitution, CreateConstitutionRequestBody } from '../../../../common/constitution';

@Injectable({
  providedIn: 'root'
})
export class Constitutions {
  // Service injections
  private httpRequests = inject(HttpRequests);
  
  private constitutions = new Map();

  constructor() {
    // Initialize the service by fetching all constitutions
    this.serviceGetAllConstitutions();
  }

  private async serviceGetAllConstitutions(): Promise<void> {
    this.httpRequests.authenticatedGetRequest("constitution/getAll").then((response) => {
      const constitutions = JSON.parse(response) as Constitution[];

      constitutions.forEach((constitution) => {
        // Sort users by join date
        constitution.userConstitution.sort((a, b) => (a.joinDate < b.joinDate) ? -1 : 1);
        this.constitutions.set(constitution.id, constitution);
      });
    })
  }

  getAll(): Constitution[] {
    return Array.from(this.constitutions.values());
  }

  create(body: CreateConstitutionRequestBody): void {
    this.httpRequests.authenticatedPostRequest('constitution/create', body).then((response) => {
      console.log("Constitution created:", response);
    }).catch((error) => {
      console.error("Failed to create constitution", error);
    });
  }

  join(id: number): void {
    this.httpRequests.authenticatedGetRequest(`constitution/join/${id}`).then((response) => {
      console.log("Joined constitution:", response);
    }).catch((error) => {
      console.error("Failed to join constitution", error);
    });
  }

  leave(id: number): void {
    this.httpRequests.authenticatedGetRequest(`constitution/leave/${id}`).then((response) => {
      console.log("Leave constitution:", response);
    }).catch((error) => {
      console.error("Failed to leave constitution", error);
    });
  }
}
