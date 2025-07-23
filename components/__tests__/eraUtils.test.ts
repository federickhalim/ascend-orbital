import { getProgressToNextStage } from "../../utils/getProgressToNextStage";
import {
  SECONDS_PER_LEVEL,
  LEVELS_PER_ERA,
  ANCIENT_START,
  RENAISSANCE_START,
  RENAISSANCE_END,
  FUTURE_START,
  FUTURE_END,
} from "../../config/eraThresholdConfig";
import { getCurrentEra } from "@/utils/eraUtils";

describe("getProgressToNextStage", () => {
  it("returns correct progress in Ancient Era", () => {
    const result = getProgressToNextStage(2); // Early Ancient
    expect(result.label).toBe("Progress to next Ancient Egypt upgrade");
    expect(result.current).toBe(2);
    expect(result.max).toBe(SECONDS_PER_LEVEL);
  });

  it("clamps to last Ancient stage and sets Renaissance label", () => {
    const lastAncient = RENAISSANCE_START - 1;
    const result = getProgressToNextStage(lastAncient);
    expect(result.label).toBe("Progress to Renaissance Era");
    expect(result.max).toBe(
      RENAISSANCE_START -
        (ANCIENT_START + (LEVELS_PER_ERA - 1) * SECONDS_PER_LEVEL)
    );
  });

  it("returns correct progress in Renaissance Era", () => {
    const result = getProgressToNextStage(RENAISSANCE_START + 3);
    expect(result.label).toBe("Progress to next Renaissance upgrade");
    expect(result.current).toBe(3);
    expect(result.max).toBe(SECONDS_PER_LEVEL);
  });

  it("clamps to last Renaissance stage and sets Future label", () => {
    const lastRenaissance = FUTURE_START - 1;
    const result = getProgressToNextStage(lastRenaissance);
    expect(result.label).toBe("Progress to Future Era");
    expect(result.current).toBe(
      FUTURE_START -
        1 -
        (RENAISSANCE_START + (LEVELS_PER_ERA - 1) * SECONDS_PER_LEVEL)
    );
  });

  it("returns correct progress in Future Era", () => {
    const result = getProgressToNextStage(FUTURE_START + 7);
    expect(result.label).toBe("Progress to next Future upgrade");
    expect(result.current).toBe(2); // within level 1
    expect(result.max).toBe(SECONDS_PER_LEVEL);
  });

  it("clamps to last Future stage and sets 'Coming soon!'", () => {
    const result = getProgressToNextStage(FUTURE_END - 1);
    expect(result.label).toBe("Coming soon!");
  });

  it("returns placeholder after Future Era", () => {
    const result = getProgressToNextStage(FUTURE_END + 10);
    expect(result.label).toBe("Coming soon!");
    expect(result.current).toBe(1);
    expect(result.max).toBe(1);
  });
});

describe("getCurrentEra", () => {
  it("returns ancient for time below RENAISSANCE_START", () => {
    expect(getCurrentEra(0)).toBe("ancient");
    expect(getCurrentEra(RENAISSANCE_START - 1)).toBe("ancient");
  });

  it("returns renaissance for time at or above RENAISSANCE_START", () => {
    expect(getCurrentEra(RENAISSANCE_START)).toBe("renaissance");
    expect(getCurrentEra(FUTURE_START - 1)).toBe("renaissance");
  });

  it("returns future for time at or above FUTURE_START", () => {
    expect(getCurrentEra(FUTURE_START)).toBe("future");
    expect(getCurrentEra(FUTURE_START + 100)).toBe("future");
  });
});
