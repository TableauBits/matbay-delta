// Types
interface Constitution {
  id: number,
  name: string,
  description: string,
  owner: string,
}

// Requests
interface CreateConstitutionRequestBody {
  name: string,
  description: string,
}

export type { CreateConstitutionRequestBody, Constitution };