import type { Socket } from "socket.io";
import { attachWSListeners as constitutionsListeners } from "./constitution/ws";

export function attachWSListeners(socket: Socket) {
    constitutionsListeners(socket);
}
