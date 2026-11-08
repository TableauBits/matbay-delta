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

interface UserIdResponse {
    id: string
}

interface UserUpdateRequestBody {
  displayName: string,
  imageURL: string,
  description: string,
  bannerURL: string | null,
}

export type { User, UserIdResponse, UserUpdateRequestBody };
