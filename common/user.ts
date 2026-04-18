interface User {
  id: string,
  authID: string,
  handle: string,
  displayName: string,
  imageURL: string,
  joinDate: string,
  description: string,
}

interface UserUpdateRequestBody {
  displayName: string,
  imageURL: string,
  description: string,
}

export type { User, UserUpdateRequestBody };
