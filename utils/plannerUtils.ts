export interface Task {
  id: string;
  text: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  done: boolean;
}

export function getSortedTasks(
  tasks: Task[],
  sortBy: "deadline" | "priority"
): Task[] {
  const sorted = [...tasks];

  if (sortBy === "priority") {
    const order = { High: 0, Medium: 1, Low: 2 };
    sorted.sort((a, b) => {
      if (order[a.priority] !== order[b.priority]) {
        return order[a.priority] - order[b.priority];
      }
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else {
    sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  return sorted;
}

// utils/plannerUtils.ts

export type PriorityLevel = "Low" | "Medium" | "High";

export function getPriorityColor(level: PriorityLevel): string {
  switch (level) {
    case "High":
      return "#ffe5e5";
    case "Medium":
      return "#fff5d6";
    case "Low":
      return "#e5f5e5";
    default:
      return "#ffffff"; // fallback for safety
  }
}
