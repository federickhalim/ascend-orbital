import {
  RENAISSANCE_START,
  FUTURE_START,
  LEVELS_PER_ERA,
  SECONDS_PER_LEVEL,
} from "@/config/eraThresholdConfig";

export type BadgeCategory =
  | "Era Progression"
  | "Total Focus Time"
  | "Streaks"
  | "Total Focus Days";

export interface BadgeStats {
  totalFocusTime: number; // in seconds
  streak: number; // consecutive days
  totalFocusDays: number; // days with > 0 seconds
}

export interface Badge {
  category: BadgeCategory;
  filePrefix: string;
  name: string;
  description: string;
  unlockCondition: (stats: BadgeStats) => boolean;
}

export const badgeConfig: Badge[] = [
  // 🗺️ Era Progression
  {
    category: "Era Progression",
    filePrefix: "ancientbadge",
    name: "Conqueror of Egypt",
    description: "You’ve completed the Ancient Era — welcome to the Renaissance.",
    unlockCondition: (stats) => stats.totalFocusTime >= RENAISSANCE_START,
  },
  {
    category: "Era Progression",
    filePrefix: "renaissancebadge",
    name: "Ruler of the Renaissance",
    description: "You've surpassed the Renaissance Era. Forward to the future.",
    unlockCondition: (stats) => stats.totalFocusTime >= FUTURE_START,
  },
  {
    category: "Era Progression",
    filePrefix: "futurebadge",
    name: "Beyond Time",
    description: "You've reached the final era. Focus has carried you into the future.",
    unlockCondition: (stats) =>
      stats.totalFocusTime >= FUTURE_START + LEVELS_PER_ERA * SECONDS_PER_LEVEL,
  },

  // ⏳ Total Focus Time (in seconds)
  {
    category: "Total Focus Time",
    filePrefix: "totaltime10",
    name: "The First 10",
    description: "Logged your first 10 hours of focused time — the journey begins.",
    unlockCondition: (stats) => stats.totalFocusTime >= 10 * 3600,
  },
  {
    category: "Total Focus Time",
    filePrefix: "totaltime100",
    name: "Centurion of Focus",
    description: "100 hours of focus — you're building unstoppable momentum.",
    unlockCondition: (stats) => stats.totalFocusTime >= 100 * 3600,
  },
  {
    category: "Total Focus Time",
    filePrefix: "totaltime1000",
    name: "The Thousand Hour Master",
    description: "1000 hours — your focus has become legendary.",
    unlockCondition: (stats) => stats.totalFocusTime >= 1000 * 3600,
  },

  // 🔥 Streaks
  {
    category: "Streaks",
    filePrefix: "streak10",
    name: "Streak Seeker (10 Days)",
    description: "You stayed on track for 10 days in a row. 🔥",
    unlockCondition: (stats) => stats.streak >= 10,
  },
  {
    category: "Streaks",
    filePrefix: "streak30",
    name: "One-Month Monk",
    description: "A 30-day streak — steady, calm, and committed.",
    unlockCondition: (stats) => stats.streak >= 30,
  },
  {
    category: "Streaks",
    filePrefix: "streak100",
    name: "The Unbroken 100",
    description: "100 consecutive days. A wall of discipline.",
    unlockCondition: (stats) => stats.streak >= 100,
  },

  // 📅 Total Focus Days (derived from dailyLogs)
  {
    category: "Total Focus Days",
    filePrefix: "totaldays10",
    name: "The First Ten Days",
    description: "You've focused on 10 different days. Strong start!",
    unlockCondition: (stats) => stats.totalFocusDays >= 10,
  },
  {
    category: "Total Focus Days",
    filePrefix: "totaldays100",
    name: "Century of Days",
    description: "100 focus days in total — consistency is your ally.",
    unlockCondition: (stats) => stats.totalFocusDays >= 100,
  },
  {
    category: "Total Focus Days",
    filePrefix: "totaldays1000",
    name: "1000-Day Legend",
    description: "1000 days of focus. You're in a class of your own.",
    unlockCondition: (stats) => stats.totalFocusDays >= 1000,
  },
];
