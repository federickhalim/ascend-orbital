import { getUpdatedStreak } from "../../utils/streakUtils";
import dayjs from "dayjs";

describe("getUpdatedStreak", () => {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const randomOldDate = "2023-01-01";

  it("returns same streak if already studied today", () => {
    const result = getUpdatedStreak(today, 3);
    expect(result.newStreak).toBe(3);
    expect(result.updatedDate).toBe(today);
  });

  it("increments streak if last study was yesterday", () => {
    const result = getUpdatedStreak(yesterday, 3);
    expect(result.newStreak).toBe(4);
    expect(result.updatedDate).toBe(today);
  });

  it("resets streak if last study was older than yesterday", () => {
    const result = getUpdatedStreak(randomOldDate, 3);
    expect(result.newStreak).toBe(1);
    expect(result.updatedDate).toBe(today);
  });
});
