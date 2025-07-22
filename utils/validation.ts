export function isValidUsername(username: string): boolean {
  const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
  return validUsernameRegex.test(username);
}

export function areAllFieldsFilled(...fields: string[]): boolean {
  return fields.every((field) => field.trim() !== "");
}

export function getSignupErrorMessage(apiError: any): string {
  if (apiError?.message === "EMAIL_EXISTS") {
    return "Email already registered";
  }
  return apiError?.message || "Signup failed";
}
