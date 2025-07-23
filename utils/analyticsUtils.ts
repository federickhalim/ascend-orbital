import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export function getWeeklyTrend(dailyLogs: Record<string, number>): number[] {
  const weekStart = dayjs().startOf("isoWeek");
  const trend: number[] = [];

  for (let i = 0; i < 7; i++) {
    const day = weekStart.add(i, "day").format("YYYY-MM-DD");
    const sec = dailyLogs[day] || 0;
    trend.push(Number((sec / 60).toFixed(1))); // convert to minutes, round to 1 decimal
  }

  return trend;
}

// daily insight calendar
export function formatMarkedDates(dates: string[]): Record<string, any> {
  return dates.reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: "orange" };
    return acc;
  }, {} as Record<string, any>);
}

// daily focus stats
export function getDailyStats(logs: Record<string, number>) {
  const values = Object.values(logs);
  if (values.length === 0) {
    return { average: 0, longest: 0, numDays: 0 };
  }

  const total = values.reduce((a, b) => a + b, 0);
  const average = total / values.length;
  const longest = Math.max(...values);
  return { average, longest, numDays: values.length };
}
