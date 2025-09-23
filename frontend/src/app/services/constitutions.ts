import { inject, Injectable } from '@angular/core';
import { HttpRequests } from './http-requests';
import { Constitution } from '../../../../common/constitution';

@Injectable({
  providedIn: 'root'
})
export class Constitutions {
  private httpRequests = inject(HttpRequests);

  private constitutions = new Map();

  constructor() {
    this.serviceGetAllConstitutions();
  }

  private async serviceGetAllConstitutions() {
    this.httpRequests.authenticatedGetRequest("constitution/getAll").then((response) => {
      const constitutions = JSON.parse(response) as Constitution[];
      constitutions.forEach((constitution) => {
        this.constitutions.set(constitution.id, constitution);
      });
    })
  }

  getAllConstitutions(): Constitution[] {
    return Array.from(this.constitutions.values());
  }
}
