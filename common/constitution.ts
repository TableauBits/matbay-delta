// Const
const SONGS_PER_USER_DEFAULT = 5;

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
  nSongs: number;
  userConstitution: UserConstitution[];
  songConstitution: SongConstitution[];
}

// Requests
interface CreateConstitutionRequestBody {
  name: string;
  description: string;
  nSongs: number;
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

export { 
  type Constitution,
  type UserConstitution,
  type SongConstitution,
  type AddSongConstitutionRequestBody,
  type CreateConstitutionRequestBody,
  type JoinConstitutionRequestBody,
  type LeaveConstitutionRequestBody,
  SONGS_PER_USER_DEFAULT
};