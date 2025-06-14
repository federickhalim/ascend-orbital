import {
  SECONDS_PER_LEVEL,
  LEVELS_PER_ERA,
  ANCIENT_START,
  ANCIENT_END,
  RENAISSANCE_START,
  RENAISSANCE_END,
} from "@/config/eraThresholdConfig";

export function getProgressToNextStage(focusTime: number) {
  // 🏺 Ancient Era (includes extended final stage up to RENAISSANCE_START)
  if (focusTime < RENAISSANCE_START) {
    const rawLevel = Math.floor((focusTime - ANCIENT_START) / SECONDS_PER_LEVEL);
    const currentLevel = Math.min(rawLevel, LEVELS_PER_ERA - 1);

    const stageStart = ANCIENT_START + currentLevel * SECONDS_PER_LEVEL;
    const stageEnd =
      currentLevel === LEVELS_PER_ERA - 1
        ? RENAISSANCE_START
        : stageStart + SECONDS_PER_LEVEL;

    return {
      current: focusTime - stageStart,
      max: stageEnd - stageStart,
      label:
        currentLevel === LEVELS_PER_ERA - 1
          ? "Progress to Renaissance Era"
          : "Progress to next Ancient Egypt upgrade",
    };
  }

  // 🎭 Renaissance Era
  if (focusTime < RENAISSANCE_END) {
    const currentLevel = Math.floor((focusTime - RENAISSANCE_START) / SECONDS_PER_LEVEL);
    const clampedLevel = Math.min(currentLevel, LEVELS_PER_ERA - 1);

    const stageStart = RENAISSANCE_START + clampedLevel * SECONDS_PER_LEVEL;
    const stageEnd = stageStart + SECONDS_PER_LEVEL;

    return {
      current: focusTime - stageStart,
      max: stageEnd - stageStart,
      label:
        clampedLevel === LEVELS_PER_ERA - 1
          ? "Progress to Future Era"
          : "Progress to next Renaissance upgrade",
    };
  }

  // 🛸 Future Eras (Fallback)
  return {
    current: 1,
    max: 1,
    label: "Future Era coming soon!",
  };
}