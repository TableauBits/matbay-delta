import { Injectable, inject } from '@angular/core';
import { DeltaAuth } from './delta-auth';
import { HttpRequests } from './http-requests';

import { User } from '../../../../common/user'

@Injectable({
  providedIn: 'root'
})
export class Users {
  private httpRequests = inject(HttpRequests);
  private deltaAuth = inject(DeltaAuth);
  private users = new Map<string, User>();
  currentUser: User | undefined;

  constructor() {
    this.deltaAuth.getUid().then((uid) => {
      return this.getUser(uid)
    }).then((user) => {
      if (user) this.currentUser = JSON.parse(user);
    });
  }

  async getUser(uid: string): Promise<string | void> {
    // Check if we already have the requested user
    const user = this.users.get(uid);
    if (user) return user.id;

    // Else get data from the server
    return await this.httpRequests.authenticatedRequest(`user/get/${uid}`).catch((err) => console.log("tkt", err));
  }
}
