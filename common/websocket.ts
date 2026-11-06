import type { UserConstitution, SongConstitution } from "./constitution";

enum WebsocketEvents {
    CST_USER_JOIN = "cst-user-join",        // OUT
    CST_USER_LEAVE = "cst-user-leave",      // OUT
    CST_SONG_ADD = "cst-song-add",          // OUT
    CST_SONG_REMOVE = "cst-song-remove",    // OUT
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
/// Message when a user joins a constitution: the new participation
type WSCstUserJoinMessage = UserConstitution;

/// Message when a user leaves a constitution: the removed participation
type WSCstUserLeaveMessage = UserConstitution;

/// Message when a song is added to a constitution: the new participation
type WSCstSongAddMessage = SongConstitution;

/// Message when a song is removed from a constitution: the removed participation
type WSCstSongRemoveMessage = SongConstitution;

export {
    WebsocketEvents,
    type WSInMessage,
    type WSCstSongAddMessage,
    type WSCstSongRemoveMessage,
    type WSCstUserJoinMessage,
    type WSCstUserLeaveMessage,
    type WSCstSubscribeMessage,
    type WSCstUnsubscribeMessage,
};
