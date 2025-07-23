import {
  isValidUsername,
  areAllFieldsFilled,
  getSignupErrorMessage,
} from "@/utils/validation";

describe("isValidUsername", () => {
  it("accepts alphanumeric usernames", () => {
    expect(isValidUsername("user123")).toBe(true);
  });

  it("accepts dots, underscores, and dashes", () => {
    expect(isValidUsername("john.doe_2024-a")).toBe(true);
  });

  it("rejects spaces", () => {
    expect(isValidUsername("john doe")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(isValidUsername("john@doe!")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUsername("")).toBe(false);
  });
});

// all fields are filled test
describe("areAllFieldsFilled", () => {
  it("returns true when all fields are non-empty", () => {
    expect(areAllFieldsFilled("a", "b", "c")).toBe(true);
  });

  it("returns false if any field is empty or just spaces", () => {
    expect(areAllFieldsFilled("a", "", "c")).toBe(false);
    expect(areAllFieldsFilled("  ", "x", "y")).toBe(false);
  });
});

describe("getSignupErrorMessage", () => {
  it("returns a specific message for EMAIL_EXISTS", () => {
    const error = { message: "EMAIL_EXISTS" };
    expect(getSignupErrorMessage(error)).toBe("Email already registered");
  });

  it("returns the original message if not EMAIL_EXISTS", () => {
    const error = { message: "WEIRD_ERROR" };
    expect(getSignupErrorMessage(error)).toBe("WEIRD_ERROR");
  });

  it("returns fallback message if message is undefined", () => {
    const error = {};
    expect(getSignupErrorMessage(error)).toBe("Signup failed");
  });

  it("handles null input gracefully", () => {
    expect(getSignupErrorMessage(null)).toBe("Signup failed");
  });
});
