import { formatTime } from "../../utils/timeUtils";
import { getLiveFocusTime } from "../../utils/timeUtils";

describe("formatTime", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats under 1 min correctly", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats exact minutes correctly", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(600)).toBe("10:00");
  });

  it("formats minutes + seconds correctly", () => {
    expect(formatTime(125)).toBe("02:05");
    expect(formatTime(3599)).toBe("59:59");
  });
});

describe("getLiveFocusTime", () => {
  it("adds sessionTime during stopwatch mode", () => {
    const result = getLiveFocusTime("stopwatch", "focus", 100, 20);
    expect(result).toBe(120);
  });

  it("adds sessionTime during pomodoro focus phase", () => {
    const result = getLiveFocusTime("pomodoro", "focus", 80, 25);
    expect(result).toBe(105);
  });

  it("does NOT add sessionTime during pomodoro break phase", () => {
    const result = getLiveFocusTime("pomodoro", "break", 50, 25);
    expect(result).toBe(50);
  });
});
