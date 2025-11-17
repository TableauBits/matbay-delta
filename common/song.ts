// Type
interface Artist {
  id: number;
  name: string;
  creationDate: string;
}

enum ArtistContributions {
  MAIN = "main",
  FEATURING = "featuring"
}

interface Song {
  id: number;
  creationDate: string;
  title: string;
  primaryArtist: number;
}

// Requests
interface AddArtistRequestBody {
  name: string;
}

interface AddSongRequestBody {
  title: string;
  primaryArtist: number;
}

export { type Artist, ArtistContributions, type AddArtistRequestBody, type AddSongRequestBody, type Song };