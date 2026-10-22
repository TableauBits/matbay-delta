// Type
enum ArtistContribution {
  MAIN = "main",
  FEATURING = "featuring"
}

type ArtistContributionType = `${ArtistContribution}`;

interface Artist {
  id: number;
  name: string;
  creationDate: string;
  countries: string[];
}

// Requests
interface AddArtistRequestBody {
  artist: {
    name: string;
  }
  countries: string[];
}

export {
  type AddArtistRequestBody,
  type Artist,
  ArtistContribution,
  type ArtistContributionType,
}