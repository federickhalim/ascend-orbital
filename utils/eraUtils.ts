import { RENAISSANCE_START, FUTURE_START } from "@/config/eraThresholdConfig";

export function getCurrentEra(
  focusTime: number
): "ancient" | "renaissance" | "future" {
  if (focusTime >= FUTURE_START) {
    return "future";
  } else if (focusTime >= RENAISSANCE_START) {
    return "renaissance";
  } else {
    return "ancient";
  }
}
