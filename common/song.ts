import type { ArtistContribution, ArtistContributionType } from "./artist";
import type { Source } from "./source";

// Type
interface Song {
  id: number;
  creationDate: string;
  title: string;
  primaryArtist: number;
  songArtist: { artist: number, contribution: ArtistContributionType }[];
  songSource: Source[];
  songLanguage: string[];
  releaseYear: number | null;
}

interface SongArtist {
  song: number;
  artist: number;
  contribution: ArtistContributionType;
}

// Requests
interface AddSongRequestBody {
  song: {
    title: string;
    primaryArtist: number;
    releaseYear: number | null;
  }
  otherContributions: [number, ArtistContribution][];
  sources: string[];
  languages: string[];
}

export {
  type AddSongRequestBody,
  type Song,
  type SongArtist
};