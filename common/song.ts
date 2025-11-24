import type { ArtistContribution, ArtistContributionType } from "./artist";
import type { SourcePlatformType } from "./source";

// Type
interface Song {
  id: number;
  creationDate: string;
  title: string;
  primaryArtist: number;
  songArtist: { artist: number, contribution: ArtistContributionType }[];
  songSource: { sourceID: string, platform: SourcePlatformType }[];
}

// Requests
interface AddSongRequestBody {
  song: {
    title: string;
    primaryArtist: number;
  }
  otherContributions: [number, ArtistContribution][];
  sources: string[];
}

export {
  type AddSongRequestBody,
  type Song
};