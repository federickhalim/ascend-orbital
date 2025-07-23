import dayjs from "dayjs";

export function getUpdatedStreak(
  lastStudyDate: string,
  currentStreak: number
): {
  newStreak: number;
  updatedDate: string;
} {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  if (lastStudyDate === today) {
    return { newStreak: currentStreak, updatedDate: today };
  }

  if (lastStudyDate === yesterday) {
    return { newStreak: currentStreak + 1, updatedDate: today };
  }

  return { newStreak: 1, updatedDate: today };
}
