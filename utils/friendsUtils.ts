export interface User {
  uid: string;
  username: string;
  totalFocusTime: number;
  streak: number;
  friends?: string[];
  friendRequests?: string[];
}

export function getSortedLeaderboard(
  friends: User[],
  currentUser?: User | null
): User[] {
  const combined = [...friends];
  if (currentUser) {
    combined.push(currentUser);
  }
  return combined.sort((a, b) => b.totalFocusTime - a.totalFocusTime);
}
