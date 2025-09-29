import type { Socket } from "socket.io";
import { attachWSListeners as authListeners } from "./auth/ws";
import { attachWSListeners as constitutionsListeners } from "./constitutions/ws";

export function attachWSListeners(socket: Socket) {
  authListeners(socket);
  constitutionsListeners(socket);
}
