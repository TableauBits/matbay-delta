// Types
interface Constitution {
  id: number,
  name: string,
  description: string,
  owner: string,
  creationDate: string,
  userConstitution: {
    user: string,
    joinDate: string
  }[]
}

// Requests
interface CreateConstitutionRequestBody {
  name: string,
  description: string,
}

export type { CreateConstitutionRequestBody, Constitution };