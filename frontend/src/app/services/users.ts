import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { User, UserUpdateRequestBody } from '../../../../common/user';
import { DeltaAuth } from './delta-auth';
import { HttpRequests } from './requests/http-requests';

@Injectable({
  providedIn: 'root',
})
export class Users {
  // Service injections
  private deltaAuth = inject(DeltaAuth);
  private httpRequests = inject(HttpRequests);

  // Cache of user data to avoid redundant requests
  private users = new Map<string, ReplaySubject<User>>();

  get(uid: string): Observable<User> {
    // Check if we already have the requested user
    const user = this.users.get(uid);
    if (user) return user.asObservable();

    // Else get data from the server
    const newUser = new ReplaySubject<User>(1);
    this.users.set(uid, newUser);

    this.httpRequests
      .authenticatedGetRequest<User>(`user/get/${uid}`)
      .then((user) => {
        newUser.next(user);
      })
      .catch((error) => {
        newUser.error(error);
      });

    return newUser.asObservable();
  }

  async getCurrentUser(): Promise<Observable<User> | undefined> {
    const uid = await this.deltaAuth.getUid();
    return this.get(uid);
  }

  async updateCurrentUserInfo(userInfo: UserUpdateRequestBody): Promise<void> {
    const uid = await this.deltaAuth.getUid();

    this.httpRequests
      .authenticatedPostRequest<UserUpdateRequestBody, User>(`user/update`, userInfo)
      .then((user) => {
        const userSubject = this.users.get(uid);
        if (userSubject) userSubject.next(user);
      })
      .catch((error) => {
        console.error('failed to update user info', error);
      });
  }
}
