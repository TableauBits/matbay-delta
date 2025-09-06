import { inject, Injectable } from '@angular/core';
import { HttpRequests } from './http-requests';

import { User } from '../../../../common/user'
import { DeltaAuth } from './delta-auth';

@Injectable({
  providedIn: 'root'
})
export class Users {
  private httpRequests = inject(HttpRequests);
  private deltaAuth = inject(DeltaAuth);
  private users: Map<string, User> = new Map();
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
