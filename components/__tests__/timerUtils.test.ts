import { getNewFocusTime } from "../../utils/timerUtils";

describe("getNewFocusTime", () => {
  it("adds focus time correctly", () => {
    expect(getNewFocusTime(25, 5)).toBe(30);
  });

  it("returns the same when delta is 0", () => {
    expect(getNewFocusTime(40, 0)).toBe(40);
  });

  it("subtracts correctly when delta is negative", () => {
    expect(getNewFocusTime(50, -20)).toBe(30);
  });

  it("handles large values", () => {
    expect(getNewFocusTime(1000, 500)).toBe(1500);
  });
});
