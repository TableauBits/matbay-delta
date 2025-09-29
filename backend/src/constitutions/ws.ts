import type { Socket } from "socket.io";
import type { DB } from "../db-namepsace";

import { WebsocketEvents, type WSUserJoinMessage, type WSUserLeaveMessage } from "../../../common/websocket";
import { io } from "../main";

export function attachWSListeners(socket: Socket) {
  socket.join(`${WebsocketEvents.CST_USER_JOIN}:ALL`);
  socket.join(`${WebsocketEvents.CST_USER_LEAVE}:ALL`);
}

export function onUserJoinCallback(joinInfo: DB.UserConstitution) {
  const message: WSUserJoinMessage = {
    constitution: joinInfo.constitution,
    userConstitution: {
      user: joinInfo.user,
      joinDate: joinInfo.joinDate
    }
  }

  io.to(`${WebsocketEvents.CST_USER_JOIN}:ALL`)
  .to(`${WebsocketEvents.CST_USER_JOIN}:${joinInfo.constitution}`)
  .emit(WebsocketEvents.CST_USER_JOIN, message);
}

export function onUserLeaveCallback(leaveInfo: DB.UserConstitution) {
  const message: WSUserLeaveMessage = {
    constitution: leaveInfo.constitution,
    user: leaveInfo.user
  }

  io.to(`${WebsocketEvents.CST_USER_LEAVE}:ALL`)
  .to(`${WebsocketEvents.CST_USER_LEAVE}:${leaveInfo.constitution}`)
  .emit(WebsocketEvents.CST_USER_LEAVE, message);
}
