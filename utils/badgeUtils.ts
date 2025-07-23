import { Badge } from "@/constants/badgeConfig";

export function getTotalFocusDays(dailyLogs: Record<string, number>): number {
  return Object.values(dailyLogs).filter((seconds) => seconds > 0).length;
}

// Splits all badges into unlocked and locked based on unlockedIds

export function splitBadgesByUnlockStatus(
  badgeList: Badge[],
  unlockedIds: string[]
): { unlocked: Badge[]; locked: Badge[] } {
  const unlocked = badgeList.filter((b) => unlockedIds.includes(b.filePrefix));
  const locked = badgeList.filter((b) => !unlockedIds.includes(b.filePrefix));
  return { unlocked, locked };
}
