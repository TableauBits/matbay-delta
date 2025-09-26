import type { Socket } from "socket.io";
import { attachWSListeners as authListeners } from "./auth/ws";

export function attachWSListeners(socket: Socket) {
  authListeners(socket);
}
