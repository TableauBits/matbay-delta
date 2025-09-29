// type CallbackFunction = (...args: unknown[]) => void;

import type { UserConstitution } from "./constitution";

enum WebsocketEvents {
  AUTH = "delta-authenticate",            // IN-OUT
  CST_USER_JOIN = "cst-user-join",        // OUT
  CST_USER_LEAVE = "cst-user-leave",      // OUT
}

interface WSUserJoinMessage {
  constitution: number;         // ID of the constitution
  userConstitution: UserConstitution;
}

interface WSUserLeaveMessage {
  constitution: number;
  user: string;
}

export { WebsocketEvents, type WSUserJoinMessage, type WSUserLeaveMessage };