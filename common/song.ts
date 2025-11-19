import type { ArtistContribution } from "./artist";

// Type
interface Song {
  id: number;
  creationDate: string;
  title: string;
  primaryArtist: number;
}

// Requests
interface AddSongRequestBody {
  song: {
    title: string;
    primaryArtist: number;
  }
  otherContributions: [number, ArtistContribution][];
}

export {
  type AddSongRequestBody,
  type Song
};