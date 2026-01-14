import { CallbackFunction, WsRequests } from './ws-requests';
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
import { HttpRequests } from './http-requests';


@Injectable({
  providedIn: 'root',
})
export class Constitutions implements OnDestroy {
  // Service injections
  private httpRequests = inject(HttpRequests);
  private wsRequests = inject(WsRequests);

  private constitutions = new Map<number, Constitution>();
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
    // Initialize the service by fetching all constitutions
    this.serviceGetAllConstitutions();

    // Initialize the list of events to react with websockets
    this.wsEvents = new Map()
      .set(WebsocketEvents.CST_SONG_ADD, this.onSongAdd.bind(this))
      .set(WebsocketEvents.CST_USER_JOIN, this.onUserJoin.bind(this))
      .set(WebsocketEvents.CST_USER_LEAVE, this.onUserLeave.bind(this));

    this.wsEvents.forEach((value, key) => this.wsRequests.on(key, value));
  }

  private async serviceGetAllConstitutions(): Promise<void> {
    this.httpRequests.authenticatedGetRequest<Constitution[]>('constitution/getAll').then((constitutions) => {
      constitutions.forEach(async (constitution) => {
        // Subscribe to the changes in the constitution
        await this.wsRequests.emit<WSCstSubscribeMessage>(WebsocketEvents.CST_SUBSCRIBE, {
          constitution: constitution.id,
        });
        this.constitutions.set(constitution.id, constitution);
      });
    });
  }
  
  get(id: number): Constitution | undefined {
    return this.constitutions.get(id);
  }

  getAll(): Constitution[] {
    return Array.from(this.constitutions.values());
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
    constitution.songConstitution.push(message.songConstitution);
  }

  private onUserJoin(message: WSCstUserJoinMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.userConstitution.push(message.userConstitution);
  }

  private onUserLeave(message: WSCstUserLeaveMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.userConstitution = constitution.userConstitution.filter((uc) => uc.user !== message.user);
  }
}
