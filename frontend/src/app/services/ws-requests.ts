import { inject, Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { WebsocketEvents, WSInMessage } from '../../../../common/websocket';
import { DeltaAuth } from './delta-auth';

export type CallbackFunction = (...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class WsRequests {
  private deltaAuth = inject(DeltaAuth);
  private socket = io(environment.server.ws);

  on(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.on(event, callback);
  }

  off(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.off(event, callback);
  }

  async emit<T extends WSInMessage>(event: WebsocketEvents, data: Omit<T, "deltaAuth">): Promise<void> {
    const token = await this.deltaAuth.getIdToken()
    this.socket.emit(event, { ...data, deltaAuth: token.__raw });
  }
}
