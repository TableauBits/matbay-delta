import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// Tables
/// Songs table
const songs = sqliteTable(
    "songs",
    {
        id: integer("id").primaryKey(),
        creationDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),

        title: text().notNull(),
        /// This column is necessary to enforce that a song as at least one artist
        primaryArtist: integer()
            .notNull()
            .references(() => artists.id),
    },
    (t) => [unique().on(t.title, t.primaryArtist)],
);

/// Artists table
const artists = sqliteTable("artists", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    name: text().notNull(),
});

/// Albums table
const albums = sqliteTable("albums", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    title: text().notNull(),
});

// Relations
/// song <==> artist
const songArtist = sqliteTable(
    "songArtist",
    {
        id: integer("id").primaryKey(),

        song: integer()
            .notNull()
            .references(() => songs.id),
        artist: integer()
            .notNull()
            .references(() => artists.id),
        contribution: text({ enum: ["main", "featuring"] })
            .notNull()
            .default("main"),
    },
    (t) => [unique().on(t.artist, t.song, t.contribution)],
);

// One song can have multiple artists
const songToArtists = relations(songs, ({ many }) => ({
    songArtist: many(songArtist),
}));

// One artist can have multiple song contributions
const artistToSongs = relations(artists, ({ many }) => ({
    songArtist: many(songArtist),
}));

// An entry in the songArtist table only references one song and one artist
const songArtistRelation = relations(songArtist, ({ one }) => ({
    song: one(songs, { fields: [songArtist.song], references: [songs.id] }),
    artist: one(artists, { fields: [songArtist.artist], references: [artists.id] }),
}));

/// song <==> album
const songAlbum = sqliteTable(
    "songAlbum",
    {
        id: integer("id").primaryKey(),

        song: integer()
            .notNull()
            .references(() => songs.id),
        album: integer()
            .notNull()
            .references(() => albums.id),
    },
    (t) => [unique().on(t.song, t.album)],
);

// One song can be in multiple albums
const songToAlbum = relations(songs, ({ many }) => ({
    songAlbum: many(songAlbum),
}));

// One album can contain multiple songs
const albumToSong = relations(albums, ({ many }) => ({
    songAlbum: many(songAlbum),
}));

// An entry in the songAlbum table only references one song and one album
const songAlbumRelation = relations(songAlbum, ({ one }) => ({
    song: one(songs, { fields: [songAlbum.song], references: [songs.id] }),
    album: one(albums, { fields: [songAlbum.album], references: [albums.id] }),
}));

/// artist <==> album
const artistAlbum = sqliteTable(
    "artistAlbum",
    {
        id: integer("id").primaryKey(),

        artist: integer()
            .notNull()
            .references(() => artists.id),
        album: integer()
            .notNull()
            .references(() => albums.id),
    },
    (t) => [unique().on(t.artist, t.album)],
);

// One artist can participate in multiple albums
const artistToAlbum = relations(artists, ({ many }) => ({
    artistAlbum: many(artistAlbum),
}));

// One album can feature multiple artists
const albumToArtist = relations(albums, ({ many }) => ({
    artistAlbum: many(artistAlbum),
}));

// An entry in the artistAlbum table only references one artist and one album
const artistAlbumRelation = relations(artistAlbum, ({ one }) => ({
    artist: one(artists, { fields: [artistAlbum.artist], references: [artists.id] }),
    album: one(albums, { fields: [artistAlbum.album], references: [albums.id] }),
}));

export {
    artists,
    songArtist,
    songs,
    songToArtists,
    artistToSongs,
    songArtistRelation,
    songAlbum,
    artistAlbum,
    songToAlbum,
    albumToSong,
    songAlbumRelation,
    artistToAlbum,
    albumToArtist,
    artistAlbumRelation,
};
