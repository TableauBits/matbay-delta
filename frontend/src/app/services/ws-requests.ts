import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { WebsocketEvents } from '../../../../common/websocket';

export type CallbackFunction = (...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class WsRequests implements OnDestroy {
  private socket = io(environment.server.ws);
  // private eventListeners = new Map<WebsocketEvents, CallbackFunction>();

  ngOnDestroy(): void {
    // this.eventListeners.forEach((callback, event) => {
    //   this.off(event, callback);
    // });
  }

  on(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.on(event, callback);
    // this.eventListeners.set(event, callback);
  }

  off(event: WebsocketEvents, callback: CallbackFunction) {
    this.socket.off(event, callback);
    // this.eventListeners.delete(event);
  }

  emit(event: WebsocketEvents, data: unknown): void {
    this.socket.emit(event, data);
  }
}
