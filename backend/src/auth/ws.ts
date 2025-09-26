import type { Socket } from "socket.io";
import { WebsocketEvents } from "../../../common/websocket";
import consola from "consola";

// TODO : Type auth message
function authHandler(data: any, socket: Socket) {
    consola.info(data);
    let token = data["token"];
    consola.info(`Received auth token: ${token}`);
    socket.emit(WebsocketEvents.AUTH, "LOGIN WORKED");
}

export function attachWSListeners(socket: Socket) {
    socket.on(WebsocketEvents.AUTH, (data) => {authHandler(data, socket)});
}
