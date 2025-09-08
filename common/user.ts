interface User {
  id: string,
  authID: string,
  username: string,
  imageURL: string,
  joinDate: string,
  description: string,
}

interface UserUpdateRequestBody {
  username: string,
  imageURL: string,
  description: string,
}

export type { User, UserUpdateRequestBody };