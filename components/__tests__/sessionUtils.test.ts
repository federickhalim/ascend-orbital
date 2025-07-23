import { getSessionUpdate } from "../../utils/sessionUtils";
import dayjs from "dayjs";

describe("getSessionUpdate", () => {
  const today = dayjs().format("YYYY-MM-DD");

  it("adds session time to totalFocusTime", () => {
    const result = getSessionUpdate(60, {}, 30);
    expect(result.updatedFocusTime).toBe(90);
  });

  it("adds session time to new dailyLogs entry", () => {
    const result = getSessionUpdate(0, {}, 20);
    expect(result.updatedLogs[today]).toBe(20);
  });

  it("adds session time to existing dailyLogs entry", () => {
    const result = getSessionUpdate(0, { [today]: 10 }, 15);
    expect(result.updatedLogs[today]).toBe(25);
  });

  it("returns today's date", () => {
    const result = getSessionUpdate(0, {}, 5);
    expect(result.today).toBe(today);
  });
});
