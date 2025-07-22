import { getSortedTasks, Task } from "@/utils/plannerUtils";
import { getPriorityColor } from "../../utils/plannerUtils";

const mockTasks: Task[] = [
  {
    id: "1",
    text: "Task A",
    dueDate: "2025-07-25",
    priority: "Medium",
    done: false,
  },
  {
    id: "2",
    text: "Task B",
    dueDate: "2025-07-22",
    priority: "High",
    done: false,
  },
  {
    id: "3",
    text: "Task C",
    dueDate: "2025-07-23",
    priority: "Low",
    done: false,
  },
];

describe("getSortedTasks", () => {
  it("sorts tasks by deadline", () => {
    const result = getSortedTasks(mockTasks, "deadline");
    expect(result.map((t) => t.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts tasks by priority", () => {
    const result = getSortedTasks(mockTasks, "priority");
    expect(result.map((t) => t.id)).toEqual(["2", "1", "3"]);
  });

  it("does not mutate original tasks array", () => {
    const copy = [...mockTasks];
    getSortedTasks(mockTasks, "priority");
    expect(mockTasks).toEqual(copy);
  });
});

describe("getPriorityColor", () => {
  it("returns correct color for High priority", () => {
    expect(getPriorityColor("High")).toBe("#ffe5e5");
  });

  it("returns correct color for Medium priority", () => {
    expect(getPriorityColor("Medium")).toBe("#fff5d6");
  });

  it("returns correct color for Low priority", () => {
    expect(getPriorityColor("Low")).toBe("#e5f5e5");
  });

  it("returns fallback color for unknown input", () => {
    expect(getPriorityColor("Unknown" as any)).toBe("#ffffff");
  });
});
