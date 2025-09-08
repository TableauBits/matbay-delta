import { Injectable, inject } from '@angular/core';
import { DeltaAuth } from './delta-auth';
import { HttpRequests } from './http-requests';

import { User, UserUpdateRequestBody } from '../../../../common/user'
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Users {
  private httpRequests = inject(HttpRequests);
  private deltaAuth = inject(DeltaAuth);
  private users = new Map<string, ReplaySubject<User>>();

  getUser(uid: string | null): Observable<User> | undefined {
    if (!uid) return undefined;

    // Check if we already have the requested user
    const user = this.users.get(uid)
    if (user) return user.asObservable();

    // Else get data from the server
    const newUser = new ReplaySubject<User>(1)

    this.httpRequests.authenticatedGetRequest(`user/get/${uid}`).then((response) => {
    const user = JSON.parse(response) as User;
      newUser.next(user);
      this.users.set(uid, newUser);
    })

    return newUser.asObservable();
  }

  async getCurrentUser(): Promise<Observable<User> | undefined> {
    const uid = await this.deltaAuth.getUid();
    return this.getUser(uid);
  }
  async updateCurrentUserInfo(userInfo: UserUpdateRequestBody): Promise<User | void> {
    const uid = await this.deltaAuth.getUid();

    this.httpRequests.authenticatedPostRequest(`user/update/${uid}`, userInfo).then((response) => {
      const updatedUser = JSON.parse(response) as User;
      const userSubject = this.users.get(uid);

      if (userSubject) userSubject.next(updatedUser);
    });
  }
}
