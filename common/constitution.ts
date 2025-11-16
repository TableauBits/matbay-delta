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

interface AddSongConstitutionRequestBody {
  song: number;
  constitution: number;
}

export type { AddSongConstitutionRequestBody, CreateConstitutionRequestBody, Constitution, JoinConstitutionRequestBody, LeaveConstitutionRequestBody, UserConstitution };