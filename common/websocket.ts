import type { UserConstitution } from "./constitution";

enum WebsocketEvents {
  AUTH = "delta-authenticate",            // IN-OUT

  // CST
  CST_USER_JOIN = "cst-user-join",        // OUT
  CST_USER_LEAVE = "cst-user-leave",      // OUT
  CST_SUBSCRIBE = "cst-subscribe",        // IN
  CST_UNSUBSCRIBE = "cst-unsubscribe"    // IN
}

// IN MESSAGES (user ==> server)
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

// OUT MESSAGES (server ==> users)

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

export {
  WebsocketEvents,
  type WSCstUserJoinMessage, type WSCstUserLeaveMessage, type WSCstSubscribeMessage, type WSCstUnsubscribeMessage
};