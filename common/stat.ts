interface GlobalStats {
  users: number;
  songs: number;
  artists: number;
  constitutions: number;
}

interface UserStats {
  songs: number;
  constitutions: number;
}

export { type GlobalStats, type UserStats };