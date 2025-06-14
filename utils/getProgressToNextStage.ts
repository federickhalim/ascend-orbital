import {
  SECONDS_PER_LEVEL,
  ANCIENT_START,
  RENAISSANCE_START,
} from "@/config/eraThresholdConfig";

export function getProgressToNextStage(focusTime: number) {
  const ANCIENT_END = RENAISSANCE_START;
  const RENAISSANCE_END = RENAISSANCE_START + 3 * SECONDS_PER_LEVEL;

  // Ancient Era
  if (focusTime < RENAISSANCE_START) {
    const currentLevel = Math.floor((focusTime - ANCIENT_START) / SECONDS_PER_LEVEL);
    const stageStart = ANCIENT_START + currentLevel * SECONDS_PER_LEVEL;
    const stageEnd = stageStart + SECONDS_PER_LEVEL;

    const isLastStage = stageEnd >= RENAISSANCE_START;
    return {
      current: focusTime - stageStart,
      max: SECONDS_PER_LEVEL,
      label: isLastStage
        ? "Progress to Renaissance Era"
        : "Progress to next Ancient Egypt upgrade",
    };
  }

  // Renaissance Era
  const currentLevel = Math.floor((focusTime - RENAISSANCE_START) / SECONDS_PER_LEVEL);
  const stageStart = RENAISSANCE_START + currentLevel * SECONDS_PER_LEVEL;
  const stageEnd = stageStart + SECONDS_PER_LEVEL;

  const isLastStage = stageEnd >= RENAISSANCE_START + 3 * SECONDS_PER_LEVEL;
  return {
    current: focusTime - stageStart,
    max: SECONDS_PER_LEVEL,
    label: isLastStage
      ? "Final Renaissance stage reached!"
      : "Progress to next Renaissance upgrade",
  };
}

