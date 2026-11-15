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

interface UserSongShowcase {
  id: number,
  user: string,
  song: number,
  addDate: string,
}

interface UserIdResponse {
    id: string
}

// Requests
interface UserUpdateRequestBody {
  displayName: string,
  imageURL: string,
  description: string,
  bannerURL: string | null,
}

interface UserAddSongShowcaseRequestBody {
  songs: number[],
}

export type { User, UserSongShowcase, UserIdResponse, UserUpdateRequestBody, UserAddSongShowcaseRequestBody };
