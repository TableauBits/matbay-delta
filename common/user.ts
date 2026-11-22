// Types
interface User {
  id: string,
  authID: string,
  handle: string,
  displayName: string,
  imageURL: string,
  bannerURL: string | null,
  joinDate: string,
  description: string,
}

interface UserArtistShowcase {
  id: number,
  user: string,
  artist: number,
  addDate: string,
}

interface UserSongShowcase {
  id: number,
  user: string,
  song: number,
  addDate: string,
}

interface UserIdResponse {
    id: string
}

interface UserShowcase {
    songShowcase: UserSongShowcase[],
    artistShowcase: UserArtistShowcase[],
}

// Request bodies
interface UserUpdateRequestBody {
  displayName: string,
  imageURL: string,
  description: string,
  bannerURL: string | null,
}

interface UserAddArtistShowcaseRequestBody {
  artists: number[],
}

interface UserAddSongShowcaseRequestBody {
  songs: number[],
}

export type { 
  User, 
  UserAddArtistShowcaseRequestBody,
  UserAddSongShowcaseRequestBody,
  UserArtistShowcase,
  UserShowcase,
  UserIdResponse,
  UserSongShowcase,
  UserUpdateRequestBody,
};
