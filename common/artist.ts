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
}

// Requests
interface AddArtistRequestBody {
  name: string;
}

export {
  type AddArtistRequestBody,
  type Artist,
  ArtistContribution,
  type ArtistContributionType,
}