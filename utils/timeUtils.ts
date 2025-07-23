export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function getLiveFocusTime(
  mode: "pomodoro" | "stopwatch",
  pomodoroPhase: "focus" | "break",
  totalFocusTime: number,
  sessionTime: number
): number {
  return mode === "pomodoro" && pomodoroPhase === "break"
    ? totalFocusTime
    : totalFocusTime + sessionTime;
}
