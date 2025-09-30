import type { Socket } from "socket.io";
import type { DB } from "../db-namepsace";
import { WebsocketEvents, type WSCstSubscribeMessage, type WSInMessage, type WSCstUnsubscribeMessage, type WSCstUserJoinMessage, type WSCstUserLeaveMessage } from "../../../common/websocket";
import { io } from "../main";
import { validateToken } from "../auth/token";

async function validateMessage(message: WSInMessage): Promise<boolean> {
  return (await validateToken(message.deltaAuth)).isOk();
}

function attachWSListeners(socket: Socket) {
  // Subscribe the user to the changes on a constitution :
    // The users list (when joining or leaving)
  socket.on(WebsocketEvents.CST_SUBSCRIBE, async (message: WSCstSubscribeMessage) => {
    const isValid = await validateMessage(message);
    if (!isValid) return;
    socket.join(`${WebsocketEvents.CST_USER_JOIN}:${message.constitution}`)
    socket.join(`${WebsocketEvents.CST_USER_LEAVE}:${message.constitution}`)
  });

  // Unsubscribre the user of the changes
  socket.on(WebsocketEvents.CST_UNSUBSCRIBE, async (message: WSCstUnsubscribeMessage) => {   
    const isValid = await validateMessage(message);
    if (!isValid) return;
    socket.leave(`${WebsocketEvents.CST_USER_JOIN}:${message.constitution}`)
    socket.leave(`${WebsocketEvents.CST_USER_LEAVE}:${message.constitution}`)
  })
}

function onUserJoinCallback(joinInfo: DB.UserConstitution) {
  const message: WSCstUserJoinMessage = {
    constitution: joinInfo.constitution,
    userConstitution: {
      user: joinInfo.user,
      joinDate: joinInfo.joinDate
    }
  }

  io.to(`${WebsocketEvents.CST_USER_JOIN}:${joinInfo.constitution}`)
    .emit(WebsocketEvents.CST_USER_JOIN, message);
}

function onUserLeaveCallback(leaveInfo: DB.UserConstitution) {
  const message: WSCstUserLeaveMessage = {
    constitution: leaveInfo.constitution,
    user: leaveInfo.user
  }

  io.to(`${WebsocketEvents.CST_USER_LEAVE}:${leaveInfo.constitution}`)
    .emit(WebsocketEvents.CST_USER_LEAVE, message);
}

export { attachWSListeners, onUserJoinCallback, onUserLeaveCallback }