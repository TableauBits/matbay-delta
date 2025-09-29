import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { WebsocketEvents } from '../../../../common/websocket';

export type CallbackFunction = (...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class WsRequests {
  private socket = io(environment.server.ws);

  on(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.on(event, callback);
  }

  off(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.off(event, callback);
  }

  emit(event: WebsocketEvents, data: unknown): void {
    this.socket.emit(event, data);
  }
}
