import type { Socket } from "socket.io";
import type { DB } from "../db-namepsace";
import { WebsocketEvents, type WSCstSubscribeMessage, type WSCstUnsubscribeMessage, type WSCstUserJoinMessage, type WSCstUserLeaveMessage } from "../../../common/websocket";
import { io } from "../main";

function attachWSListeners(socket: Socket) {
  // Subscribe the user to the changes on a constitution :
    // The users list (when joining or leaving)
  socket.on(WebsocketEvents.CST_SUBSCRIBE, (data) => {
    const constitution = (data as WSCstSubscribeMessage).constitution;
    socket.join(`${WebsocketEvents.CST_USER_JOIN}:${constitution}`)
    socket.join(`${WebsocketEvents.CST_USER_LEAVE}:${constitution}`)
  });

  // Unsubscribre the user of the changes
  socket.on(WebsocketEvents.CST_UNSUBSCRIBE, (data) => {    
    const constitution = (data as WSCstUnsubscribeMessage).constitution;
    socket.leave(`${WebsocketEvents.CST_USER_JOIN}:${constitution}`)
    socket.leave(`${WebsocketEvents.CST_USER_LEAVE}:${constitution}`)
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