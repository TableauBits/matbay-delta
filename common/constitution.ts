// Types
interface UserConstitution {
  user: string;
  joinDate: string;
}

interface Constitution {
  id: number;
  name: string;
  description: string;
  owner: string;
  creationDate: string;
  userConstitution: UserConstitution[];
}

// Requests
interface CreateConstitutionRequestBody {
  name: string;
  description: string;
}

interface JoinConstitutionRequestBody {
  id: number;
}

interface LeaveConstitutionRequestBody {
  id: number;
}

export type { CreateConstitutionRequestBody, Constitution, JoinConstitutionRequestBody, LeaveConstitutionRequestBody, UserConstitution };