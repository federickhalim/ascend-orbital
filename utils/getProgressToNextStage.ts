import {
  SECONDS_PER_LEVEL,
  LEVELS_PER_ERA,
  ANCIENT_START,
  RENAISSANCE_START,
  RENAISSANCE_END,
  FUTURE_START,
  FUTURE_END,
} from "@/config/eraThresholdConfig";

export function getProgressToNextStage(focusTime: number) {
  // 🏺 Ancient Era
  if (focusTime < RENAISSANCE_START) {
    const rawLevel = Math.floor((focusTime - ANCIENT_START) / SECONDS_PER_LEVEL);
    const clampedLevel = Math.min(rawLevel, LEVELS_PER_ERA - 1);

    const stageStart = ANCIENT_START + clampedLevel * SECONDS_PER_LEVEL;
    const stageEnd =
      clampedLevel === LEVELS_PER_ERA - 1
        ? RENAISSANCE_START
        : stageStart + SECONDS_PER_LEVEL;

    return {
      current: focusTime - stageStart,
      max: stageEnd - stageStart,
      label:
        clampedLevel === LEVELS_PER_ERA - 1
          ? "Progress to Renaissance Era"
          : "Progress to next Ancient Egypt upgrade",
    };
  }

  // 🎭 Renaissance Era
  if (focusTime < FUTURE_START) {
    const rawLevel = Math.floor((focusTime - RENAISSANCE_START) / SECONDS_PER_LEVEL);
    const clampedLevel = Math.min(rawLevel, LEVELS_PER_ERA - 1);

    const stageStart = RENAISSANCE_START + clampedLevel * SECONDS_PER_LEVEL;
    const stageEnd =
      clampedLevel === LEVELS_PER_ERA - 1
        ? FUTURE_START
        : stageStart + SECONDS_PER_LEVEL;

    return {
      current: focusTime - stageStart,
      max: stageEnd - stageStart,
      label:
        clampedLevel === LEVELS_PER_ERA - 1
          ? "Progress to Future Era"
          : "Progress to next Renaissance upgrade",
    };
  }

  // 🛸 Future Era
  if (focusTime < FUTURE_END) {
    const rawLevel = Math.floor((focusTime - FUTURE_START) / SECONDS_PER_LEVEL);
    const clampedLevel = Math.min(rawLevel, LEVELS_PER_ERA - 1);

    const stageStart = FUTURE_START + clampedLevel * SECONDS_PER_LEVEL;
    const stageEnd =
      clampedLevel === LEVELS_PER_ERA - 1
        ? FUTURE_END
        : stageStart + SECONDS_PER_LEVEL;

    return {
      current: focusTime - stageStart,
      max: stageEnd - stageStart,
      label:
        clampedLevel === LEVELS_PER_ERA - 1
          ? "Coming soon!"
          : "Progress to next Future upgrade",
    };
  }

  // ⏳ Post-Future Placeholder
  return {
    current: 1,
    max: 1,
    label: "Coming soon!",
  };
}
