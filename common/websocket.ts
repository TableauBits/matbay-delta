import type { UserConstitution, SongConstitution } from "./constitution";

enum WebsocketEvents {
  CST_USER_JOIN = "cst-user-join",        // OUT
  CST_USER_LEAVE = "cst-user-leave",      // OUT
  CST_SONG_ADD = "cst-song-add",          // IN
  CST_SUBSCRIBE = "cst-subscribe",        // IN
  CST_UNSUBSCRIBE = "cst-unsubscribe"     // IN
}

// IN MESSAGES (client ==> server)
/// The default interface have the "deltaAuth" field to authenticate the user and validate the request
interface WSInMessage {
  deltaAuth: string;
}

/// Subscribe to real-time changes of a constitution
interface WSCstSubscribeMessage extends WSInMessage {
  constitution: number;
}

/// Unsubscribre to the changes
interface WSCstUnsubscribeMessage extends WSInMessage {
  constitution: number;
}

// OUT MESSAGES (server ==> clients)
/// Message when a user joins a constitution
interface WSCstUserJoinMessage {
  constitution: number;         // ID of the constitution
  userConstitution: UserConstitution;
}

/// Message when a user leaves a constitution with the id of the user and the constitution.
interface WSCstUserLeaveMessage {
  constitution: number;
  user: string;
}

interface WSCstSongAddMessage {
  constitution: number;
  songConstitution: SongConstitution;
}

export {
  WebsocketEvents,
  type WSInMessage,
  type WSCstSongAddMessage,
  type WSCstUserJoinMessage,
  type WSCstUserLeaveMessage,
  type WSCstSubscribeMessage,
  type WSCstUnsubscribeMessage,
};