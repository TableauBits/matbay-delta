// Type
enum ArtistContribution {
  MAIN = "main",
  FEATURING = "featuring"
}

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
}