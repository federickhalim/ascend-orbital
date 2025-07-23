import { getSortedLeaderboard } from "../../utils/friendsUtils";
import type { User } from "@/app/(tabs)/friends";

const mockFriends = [
  { uid: "1", username: "Alice", totalFocusTime: 200, streak: 5 },
  { uid: "2", username: "Bob", totalFocusTime: 300, streak: 3 },
  { uid: "3", username: "Charlie", totalFocusTime: 100, streak: 8 },
];

const currentUser = {
  uid: "me",
  username: "You",
  totalFocusTime: 250,
  streak: 4,
};

test("Leaderboard is sorted in descending order of totalFocusTime including current user", () => {
  const sorted = getSortedLeaderboard(mockFriends, currentUser);
  const usernames = sorted.map((u) => u.username);
  expect(usernames).toEqual(["Bob", "You", "Alice", "Charlie"]);
});

test("Leaderboard is sorted correctly without current user", () => {
  const sorted = getSortedLeaderboard(mockFriends);
  const usernames = sorted.map((u) => u.username);
  expect(usernames).toEqual(["Bob", "Alice", "Charlie"]);
});

// multiple users have the same totalFocusTime
describe("getSortedLeaderboard", () => {
  it("keeps stable order when multiple users have the same totalFocusTime", () => {
    const friends = [
      { uid: "a", username: "Alice", totalFocusTime: 100, streak: 3 },
      { uid: "b", username: "Bob", totalFocusTime: 100, streak: 2 },
      { uid: "c", username: "Charlie", totalFocusTime: 90, streak: 1 },
    ];

    const currentUser = {
      uid: "me",
      username: "Me",
      totalFocusTime: 100,
      streak: 5,
    };

    const result = getSortedLeaderboard(friends, currentUser);

    expect(result.map((u) => u.uid)).toEqual(["a", "b", "me", "c"]);
  });
});

//  friends list is empty and only the current user is present
describe("getSortedLeaderboard - edge cases", () => {
  test("should return array with only current user when friends list is empty", () => {
    const currentUser: User = {
      uid: "me",
      username: "Myself",
      totalFocusTime: 300,
      streak: 5,
    };

    const result = getSortedLeaderboard([], currentUser);

    expect(result).toEqual([currentUser]);
  });
});
