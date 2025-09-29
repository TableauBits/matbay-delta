import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpRequests } from './http-requests';
import { Constitution, CreateConstitutionRequestBody, UserConstitution } from '../../../../common/constitution';
import { WebsocketEvents, WSUserJoinMessage, WSUserLeaveMessage } from '../../../../common/websocket';
import { WsRequests } from './ws-requests';

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

  ngOnDestroy(): void {
    // TODO: Add .bind() to off the correct event ?
    this.wsRequests.off(WebsocketEvents.CST_USER_JOIN, this.onUserJoin);
    this.wsRequests.off(WebsocketEvents.CST_USER_LEAVE, this.onUserLeave);
  }

  constructor() {
    // Initialize the service by fetching all constitutions
    this.serviceGetAllConstitutions();
    this.wsRequests.on(WebsocketEvents.CST_USER_JOIN, this.onUserJoin.bind(this));
    this.wsRequests.on(WebsocketEvents.CST_USER_LEAVE, this.onUserLeave.bind(this));
  }

  private async serviceGetAllConstitutions(): Promise<void> {
    this.httpRequests.authenticatedGetRequest("constitution/getAll").then((response) => {
      const constitutions = JSON.parse(response) as Constitution[];

      constitutions.forEach((constitution) => {
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
  onUserJoin(message: WSUserJoinMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.userConstitution.push(message.userConstitution);
    constitution.userConstitution.sort((a, b) => sortByJoinDate(a, b));
  }

  onUserLeave(message: WSUserLeaveMessage): void {
    const constitution = this.constitutions.get(message.constitution);
    if (!constitution) return;
    constitution.userConstitution = constitution.userConstitution.filter(uc => uc.user !== message.user);
    constitution.userConstitution.sort((a, b) => sortByJoinDate(a, b));
  }
}
