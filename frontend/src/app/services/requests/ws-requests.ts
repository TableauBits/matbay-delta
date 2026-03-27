import { Injectable, inject } from '@angular/core';
import { WSInMessage, WebsocketEvents } from '../../../../../common/websocket';
import { DeltaAuth } from '../delta-auth';
import { environment } from '../../../environments/environment';
import { io } from 'socket.io-client';

export type CallbackFunction = (...args: unknown[]) => void;

@Injectable({
  providedIn: 'root',
})
export class WsRequests {
  private deltaAuth = inject(DeltaAuth);
  private socket = io(`${environment.server.wsProtocol}${environment.server.domain}`);

  on(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.on(event, callback);
  }

  off(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.off(event, callback);
  }

  async emit<T extends WSInMessage>(event: WebsocketEvents, data: Omit<T, 'deltaAuth'>): Promise<void> {
    const token = await this.deltaAuth.getIdToken();
    this.socket.emit(event, { ...data, deltaAuth: token.__raw });
  }
}
