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
      return this.getUser(uid);
    }).then((user) => {
      if (user) this.currentUser = user;
    });
  }

  async getUser(uid: string): Promise<User | void> {
    // Check if we already have the requested user
    if (this.users.has(uid)) return this.users.get(uid);

    // Else get data from the server
    const response = await this.httpRequests.authenticatedRequest(`user/get/${uid}`).catch((err) => console.log(`Error when trying to get infos for user ${uid}`, err));
    if (!response) return;

    // Update cache and return user
    const user = JSON.parse(response) as User;
    this.users.set(uid, user);
    return user;
  }
}
