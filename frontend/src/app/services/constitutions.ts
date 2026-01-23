import { BehaviorSubject, Observable } from 'rxjs';
import { CallbackFunction, WsRequests } from './requests/ws-requests';
import {
  Constitution,
  CreateConstitutionRequestBody,
  JoinConstitutionRequestBody,
  LeaveConstitutionRequestBody,
} from '../../../../common/constitution';
import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  WSCstSongAddMessage,
  WSCstSubscribeMessage,
  WSCstUnsubscribeMessage,
  WSCstUserJoinMessage,
  WSCstUserLeaveMessage,
  WebsocketEvents,
} from '../../../../common/websocket';
import { HttpRequests } from './requests/http-requests';

@Injectable({
  providedIn: 'root',
})
export class Constitutions implements OnDestroy {
  // Service injections
  private httpRequests = inject(HttpRequests);
  private wsRequests = inject(WsRequests);

  private constitutions = new Map<number, BehaviorSubject<Constitution | undefined>>();

  private wsEvents = new Map<WebsocketEvents, CallbackFunction>();

  ngOnDestroy(): void {
    this.constitutions.forEach(async (_, key) => {
      await this.wsRequests.emit<WSCstUnsubscribeMessage>(WebsocketEvents.CST_UNSUBSCRIBE, { constitution: key });
    });
    this.wsEvents.forEach((value, key) => {
      this.wsRequests.off(key, value);
    });
  }

  constructor() {
    // Initialize the list of events to react with websockets
    this.wsEvents = new Map()
      .set(WebsocketEvents.CST_SONG_ADD, this.onSongAdd.bind(this))
      .set(WebsocketEvents.CST_USER_JOIN, this.onUserJoin.bind(this))
      .set(WebsocketEvents.CST_USER_LEAVE, this.onUserLeave.bind(this));

    this.wsEvents.forEach((value, key) => this.wsRequests.on(key, value));
  }

  get(id: number): Observable<Constitution | undefined> {
    // Check if we already have the requested constitution
    const constitution = this.constitutions.get(id);
    if (constitution) return constitution.asObservable();

    // Else request data from backend
    const newConstitution = new BehaviorSubject<Constitution | undefined>(undefined);
    this.constitutions.set(id, newConstitution);

    this.httpRequests
      .authenticatedGetRequest<Constitution>(`constitution/get/${id}`)
      .then(async (constitution) => {
        // Subscribe to the changes of the constitution
        await this.wsRequests.emit<WSCstSubscribeMessage>(WebsocketEvents.CST_SUBSCRIBE, {
          constitution: constitution.id,
        });
        // Emit changes
        newConstitution.next(constitution);
      })
      .catch((error) => {
        newConstitution.error(error);
      });
    return newConstitution.asObservable();
  }

  create(name: string, description: string, nSongs: number): void {
    this.httpRequests
      .authenticatedPostRequest<CreateConstitutionRequestBody>('constitution/create', { name, description, nSongs })
      .catch((error) => {
        console.error('Failed to create constitution', error);
      });
  }

  join(id: number): void {
    this.httpRequests
      .authenticatedPostRequest<JoinConstitutionRequestBody>('constitution/join', { id })
      .catch((error) => {
        console.error('Failed to join constitution', error);
      });
  }

  leave(id: number): void {
    this.httpRequests
      .authenticatedPostRequest<LeaveConstitutionRequestBody>('constitution/leave', { id })
      .catch((error) => {
        console.error('Failed to leave constitution', error);
      });
  }

  // Websocket callback
  private onSongAdd(message: WSCstSongAddMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.value?.songConstitution.push(message.songConstitution);
    constitution.next(constitution.value);
  }

  private onUserJoin(message: WSCstUserJoinMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.value?.userConstitution.push(message.userConstitution);
    constitution.next(constitution.value);
  }

  private onUserLeave(message: WSCstUserLeaveMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.value!.userConstitution = constitution.value!.userConstitution.filter(
      (uc) => uc.user !== message.user,
    );
    constitution.next(constitution.value);
  }
}
