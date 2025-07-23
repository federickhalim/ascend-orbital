import dayjs from "dayjs";

export function getSessionUpdate(
  prevFocusTime: number,
  prevLogs: Record<string, number>,
  sessionTime: number
) {
  const today = dayjs().format("YYYY-MM-DD");

  const updatedFocusTime = prevFocusTime + sessionTime;

  const updatedLogs = {
    ...prevLogs,
    [today]: (prevLogs[today] || 0) + sessionTime,
  };

  return { updatedFocusTime, updatedLogs, today };
}
