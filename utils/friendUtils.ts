export function validateAddFriend(
  currentUserId: string,
  targetId: string,
  currentUserData: { friends?: string[]; friendRequests?: string[] },
  targetData: { friendRequests?: string[] }
): "self" | "alreadyFriends" | "youSentRequest" | "theySentRequest" | "ok" {
  if (currentUserId === targetId) return "self";

  const alreadyFriends = currentUserData.friends?.includes(targetId);
  if (alreadyFriends) return "alreadyFriends";

  const youSentRequest = targetData.friendRequests?.includes(currentUserId);
  if (youSentRequest) return "youSentRequest";

  const theySentRequest = currentUserData.friendRequests?.includes(targetId);
  if (theySentRequest) return "theySentRequest";

  return "ok";
}

// leaderboard
interface UserFocus {
  id: string;
  username: string;
  totalFocusTime: number;
}

interface FriendStats {
  rank: number;
  outperform: number;
  gapMessage: string;
}

export function rankFriends(
  users: UserFocus[],
  currentUserId: string
): FriendStats | null {
  if (users.length === 0) return null;

  const sorted = [...users].sort((a, b) => b.totalFocusTime - a.totalFocusTime);
  const myRank = sorted.findIndex((u) => u.id === currentUserId);

  if (myRank === -1) return null;

  const outperform =
    myRank === 0
      ? 100
      : Math.round(((sorted.length - myRank - 1) / (sorted.length - 1)) * 100);

  const gapMessage =
    myRank === 0
      ? "You're leading the board!"
      : `Catch ${sorted[myRank - 1].username} by clocking ${
          sorted[myRank - 1].totalFocusTime - sorted[myRank].totalFocusTime
        } more`;

  return {
    rank: myRank + 1,
    outperform,
    gapMessage,
  };
}
