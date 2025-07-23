import { badgeConfig } from "@/constants/badgeConfig";
import { getTotalFocusDays } from "@/utils/badgeUtils";
import { splitBadgesByUnlockStatus } from "@/utils/badgeUtils";

describe("Badge unlock logic", () => {
  it("unlocks streak10 badge when streak is 10", () => {
    const stats = {
      totalFocusTime: 0,
      streak: 10,
      totalFocusDays: 0,
    };

    const unlocked = badgeConfig.filter((b) => b.unlockCondition(stats));
    const unlockedIds = unlocked.map((b) => b.filePrefix);

    expect(unlockedIds).toContain("streak10");
  });

  it("does not unlock streak30 when streak is only 10", () => {
    const stats = {
      totalFocusTime: 0,
      streak: 10,
      totalFocusDays: 0,
    };

    const unlocked = badgeConfig.filter((b) => b.unlockCondition(stats));
    const unlockedIds = unlocked.map((b) => b.filePrefix);

    expect(unlockedIds).not.toContain("streak30");
  });

  it("unlocks totaltime100 badge when total focus time is 100 hours", () => {
    const stats = {
      totalFocusTime: 100 * 3600,
      streak: 0,
      totalFocusDays: 0,
    };

    const unlocked = badgeConfig.filter((b) => b.unlockCondition(stats));
    const unlockedIds = unlocked.map((b) => b.filePrefix);

    expect(unlockedIds).toContain("totaltime100");
  });

  it("unlocks totaldays10 when user has 10 focus days", () => {
    const stats = {
      totalFocusTime: 0,
      streak: 0,
      totalFocusDays: 10,
    };

    const unlocked = badgeConfig.filter((b) => b.unlockCondition(stats));
    const unlockedIds = unlocked.map((b) => b.filePrefix);

    expect(unlockedIds).toContain("totaldays10");
  });
});

// test focus day calculation logic
describe("getTotalFocusDays", () => {
  it("returns 0 for an empty log", () => {
    expect(getTotalFocusDays({})).toBe(0);
  });

  it("counts only days with focus time > 0", () => {
    const logs = {
      "2025-07-01": 0,
      "2025-07-02": 300,
      "2025-07-03": 150,
      "2025-07-04": 0,
    };
    expect(getTotalFocusDays(logs)).toBe(2);
  });

  it("returns correct count for all days > 0", () => {
    const logs = {
      "2025-01-01": 100,
      "2025-01-02": 200,
      "2025-01-03": 300,
    };
    expect(getTotalFocusDays(logs)).toBe(3);
  });
});

// test the badge categorization logic
describe("splitBadgesByUnlockStatus", () => {
  it("splits badges correctly into unlocked and locked", () => {
    const allBadges = [
      { filePrefix: "a" },
      { filePrefix: "b" },
      { filePrefix: "c" },
    ] as any; // Mocking Badge objects minimally

    const result = splitBadgesByUnlockStatus(allBadges, ["a", "c"]);

    expect(result.unlocked.map((b) => b.filePrefix)).toEqual(["a", "c"]);
    expect(result.locked.map((b) => b.filePrefix)).toEqual(["b"]);
  });

  it("returns all badges as locked if none are unlocked", () => {
    const allBadges = [{ filePrefix: "x" }, { filePrefix: "y" }] as any;

    const result = splitBadgesByUnlockStatus(allBadges, []);

    expect(result.unlocked).toEqual([]);
    expect(result.locked.map((b) => b.filePrefix)).toEqual(["x", "y"]);
  });

  it("returns all badges as unlocked if all are unlocked", () => {
    const allBadges = [{ filePrefix: "x" }, { filePrefix: "y" }] as any;

    const result = splitBadgesByUnlockStatus(allBadges, ["x", "y"]);

    expect(result.unlocked.map((b) => b.filePrefix)).toEqual(["x", "y"]);
    expect(result.locked).toEqual([]);
  });
});
