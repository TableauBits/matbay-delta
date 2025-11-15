import type { Socket } from "socket.io";
import {
    WebsocketEvents,
    type WSCstSubscribeMessage,
    type WSCstUnsubscribeMessage,
    type WSCstUserJoinMessage,
    type WSCstUserLeaveMessage,
    type WSInMessage,
} from "../../../common/websocket";
import { validateToken } from "../auth/token";
import type { DB } from "../db-namepsace";
import { io } from "../main";

async function validateMessage(message: WSInMessage): Promise<boolean> {
    return (await validateToken(message.deltaAuth)).isOk();
}

function attachWSListeners(socket: Socket) {
    // Subscribe the user to the changes on a constitution :
    // The user list (when a user join or leave)
    // TODO : The song list (when a song is added or removed)
    socket.on(WebsocketEvents.CST_SUBSCRIBE, async (message: WSCstSubscribeMessage) => {
        const isValid = await validateMessage(message);
        if (!isValid) return;
        socket.join(`${WebsocketEvents.CST_USER_JOIN}:${message.constitution}`);
        socket.join(`${WebsocketEvents.CST_USER_LEAVE}:${message.constitution}`);
    });

    // Unsubscribre the user of the changes
    socket.on(WebsocketEvents.CST_UNSUBSCRIBE, async (message: WSCstUnsubscribeMessage) => {
        const isValid = await validateMessage(message);
        if (!isValid) return;
        socket.leave(`${WebsocketEvents.CST_USER_JOIN}:${message.constitution}`);
        socket.leave(`${WebsocketEvents.CST_USER_LEAVE}:${message.constitution}`);
    });
}

// TODO : Add onSongAdded

function onUserJoinCallback(joinInfo: DB.Select.UserConstitution) {
    const message: WSCstUserJoinMessage = {
        constitution: joinInfo.constitution,
        userConstitution: {
            user: joinInfo.user,
            joinDate: joinInfo.joinDate,
        },
    };

    io.to(`${WebsocketEvents.CST_USER_JOIN}:${joinInfo.constitution}`).emit(WebsocketEvents.CST_USER_JOIN, message);
}

function onUserLeaveCallback(leaveInfo: DB.Select.UserConstitution) {
    const message: WSCstUserLeaveMessage = {
        constitution: leaveInfo.constitution,
        user: leaveInfo.user,
    };

    io.to(`${WebsocketEvents.CST_USER_LEAVE}:${leaveInfo.constitution}`).emit(WebsocketEvents.CST_USER_LEAVE, message);
}

export { attachWSListeners, onUserJoinCallback, onUserLeaveCallback };
