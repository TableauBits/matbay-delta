import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';

export type CallbackFunction = (...args: unknown[]) => void;

@Injectable({
  providedIn: 'root'
})
export class WsRequests {
  private socket = io(environment.server.ws);

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    this.socket.off(event, callback);
  }

  emit(event: string, data: unknown): void {
    this.socket.emit(event, data);
  }
}
