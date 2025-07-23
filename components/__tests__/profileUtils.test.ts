import { getProfileImageName } from "@/utils/profileUtils";

describe("getProfileImageName", () => {
  it("returns 'sphinx' for empty or unknown input", () => {
    expect(getProfileImageName("")).toBe("sphinx");
    expect(getProfileImageName("unknown-image.png")).toBe("sphinx");
  });

  it("returns 'griffin' when photoURL contains 'griffin'", () => {
    expect(getProfileImageName("griffin-profile.png")).toBe("griffin");
    expect(getProfileImageName("user/griffin-avatar")).toBe("griffin");
  });

  it("returns 'robot' when photoURL contains 'robot'", () => {
    expect(getProfileImageName("robot.png")).toBe("robot");
    expect(getProfileImageName("profile/robot-123")).toBe("robot");
  });
});
