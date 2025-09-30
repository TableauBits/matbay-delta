import { CallbackFunction, WsRequests } from './ws-requests';
import { Constitution, CreateConstitutionRequestBody, UserConstitution } from '../../../../common/constitution';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { WSCstSubscribeMessage, WSCstUnsubscribeMessage, WSCstUserJoinMessage, WSCstUserLeaveMessage, WebsocketEvents } from '../../../../common/websocket';
import { HttpRequests } from './http-requests';

function sortByJoinDate(a: UserConstitution, b: UserConstitution): number {
  if (a.joinDate === b.joinDate) return 0;
  return a.joinDate < b.joinDate ? -1 : 1;
}

@Injectable({
  providedIn: 'root'
})
export class Constitutions implements OnDestroy {
  // Service injections
  private httpRequests = inject(HttpRequests);
  private wsRequests = inject(WsRequests);

  private constitutions = new Map<number, Constitution>();
  private wsEvents = new Map<WebsocketEvents, CallbackFunction>;

  ngOnDestroy(): void {
    this.constitutions.forEach(async (_, key) => {
      await this.wsRequests.emit<WSCstUnsubscribeMessage>(
        WebsocketEvents.CST_UNSUBSCRIBE,
        { constitution: key }
      );
    })
    this.wsEvents.forEach((value, key) => {
      this.wsRequests.off(key, value)
    });
  }

  constructor() {
    // Initialize the service by fetching all constitutions
    this.serviceGetAllConstitutions();

    // Initialize the list of events to react with websockets
    this.wsEvents = new Map()
      .set(WebsocketEvents.CST_USER_JOIN, this.onUserJoin.bind(this))
      .set(WebsocketEvents.CST_USER_LEAVE, this.onUserLeave.bind(this))

    this.wsEvents.forEach((value, key) => this.wsRequests.on(key, value));
  }

  private async serviceGetAllConstitutions(): Promise<void> {
    this.httpRequests.authenticatedGetRequest("constitution/getAll").then((response) => {
      const constitutions = JSON.parse(response) as Constitution[];

      constitutions.forEach(async (constitution) => {
        // Subscribe to the changes in the constitution
        await this.wsRequests.emit<WSCstSubscribeMessage>(
          WebsocketEvents.CST_SUBSCRIBE,
          { constitution: constitution.id }
        );

        // Sort users by join date
        constitution.userConstitution.sort((a, b) => sortByJoinDate(a, b));
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

  // Websocket callback
  onUserJoin(message: WSCstUserJoinMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.userConstitution.push(message.userConstitution);
    constitution.userConstitution.sort((a, b) => sortByJoinDate(a, b));
  }

  onUserLeave(message: WSCstUserLeaveMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.userConstitution = constitution.userConstitution.filter(uc => uc.user !== message.user);
    constitution.userConstitution.sort((a, b) => sortByJoinDate(a, b));
  }
}
