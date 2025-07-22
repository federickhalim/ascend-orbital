import {
  getWeeklyTrend,
  formatMarkedDates,
  getDailyStats,
} from "@/utils/analyticsUtils";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

describe("getWeeklyTrend", () => {
  it("returns correct trend for current ISO week", () => {
    const monday = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
    const tuesday = dayjs()
      .startOf("isoWeek")
      .add(1, "day")
      .format("YYYY-MM-DD");
    const sunday = dayjs()
      .startOf("isoWeek")
      .add(6, "day")
      .format("YYYY-MM-DD");

    const logs = {
      [monday]: 1200, // 20 minutes
      [tuesday]: 3600, // 60 minutes
      [sunday]: 0,
    };

    const result = getWeeklyTrend(logs);
    expect(result).toEqual([20, 60, 0, 0, 0, 0, 0]);
  });

  it("returns all zeros for empty input", () => {
    const result = getWeeklyTrend({});
    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

// daily insight calendar
describe("formatMarkedDates", () => {
  it("returns marked object for given dates", () => {
    const input = ["2025-07-01", "2025-07-03"];
    const expected = {
      "2025-07-01": { marked: true, dotColor: "orange" },
      "2025-07-03": { marked: true, dotColor: "orange" },
    };
    expect(formatMarkedDates(input)).toEqual(expected);
  });

  it("returns empty object for empty input", () => {
    expect(formatMarkedDates([])).toEqual({});
  });
});

// daily stats
describe("getDailyStats", () => {
  it("returns correct stats for valid logs", () => {
    const logs = {
      "2025-07-01": 1200, // 20 mins
      "2025-07-02": 3000, // 50 mins
      "2025-07-03": 1800, // 30 mins
    };

    const result = getDailyStats(logs);
    expect(result).toEqual({
      average: 2000, // (1200+3000+1800)/3
      longest: 3000,
      numDays: 3,
    });
  });

  it("handles empty logs", () => {
    const result = getDailyStats({});
    expect(result).toEqual({
      average: 0,
      longest: 0,
      numDays: 0,
    });
  });

  it("handles single entry", () => {
    const result = getDailyStats({ "2025-07-01": 1500 });
    expect(result).toEqual({
      average: 1500,
      longest: 1500,
      numDays: 1,
    });
  });
});
