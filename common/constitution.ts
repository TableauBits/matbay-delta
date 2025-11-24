// Types
interface UserConstitution {
  user: string;
  joinDate: string;
}

interface SongConstitution {
  song: number;
  user: string;
  addDate: string;
}

interface Constitution {
  id: number;
  name: string;
  description: string;
  owner: string;
  creationDate: string;
  userConstitution: UserConstitution[];
  songConstitution: SongConstitution[];
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

export type { 
  Constitution,
  UserConstitution,
  SongConstitution,
  AddSongConstitutionRequestBody,
  CreateConstitutionRequestBody,
  JoinConstitutionRequestBody,
  LeaveConstitutionRequestBody
};