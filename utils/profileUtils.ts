export function getProfileImageName(
  photoURL: string
): "sphinx" | "griffin" | "robot" {
  if (photoURL.includes("griffin")) return "griffin";
  if (photoURL.includes("robot")) return "robot";
  return "sphinx";
}
