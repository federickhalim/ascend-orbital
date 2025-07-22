import { loginUser } from "@/utils/authUtils";
import { sendEmailVerification } from "@/utils/authUtils";
import { sendPasswordReset } from "@/utils/authUtils";

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

describe("loginUser", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it("returns MISSING_FIELDS when email or password is empty", async () => {
    const result = await loginUser("", "");
    expect(result.status).toBe("MISSING_FIELDS");
  });

  it("returns LOGIN_FAILED on failed login", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "INVALID_PASSWORD" } }),
    });

    const result = await loginUser("user@example.com", "wrongpassword");
    expect(result.status).toBe("LOGIN_FAILED");
    expect(result.message).toBe("INVALID_PASSWORD");
  });

  it("returns UNVERIFIED if email is not verified", async () => {
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          idToken: "mock-token",
          localId: "mock-id",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [{ emailVerified: false }],
        }),
      });

    const result = await loginUser("user@example.com", "correctpassword");
    expect(result.status).toBe("UNVERIFIED");
    expect(result.idToken).toBe("mock-token");
  });

  it("returns OK on successful login and verified email", async () => {
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          idToken: "verified-token",
          localId: "verified-id",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [{ emailVerified: true }],
        }),
      });

    const result = await loginUser("verified@example.com", "securepassword");
    expect(result.status).toBe("OK");
    expect(result.idToken).toBe("verified-token");
    expect(result.userId).toBe("verified-id");
  });
});

// test resend email verification
describe("sendEmailVerification", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it("returns OK when email verification is sent successfully", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const result = await sendEmailVerification("valid-token");
    expect(result).toBe("OK");
  });

  it("returns error message when Firebase returns error", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: "INVALID_ID_TOKEN" },
      }),
    });

    const result = await sendEmailVerification("invalid-token");
    expect(result).toBe("INVALID_ID_TOKEN");
  });

  it("returns generic error message when exception is thrown", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await sendEmailVerification("any-token");
    expect(result).toBe("Network error");
  });
});

// test forgot password
describe("sendPasswordReset", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns OK when reset email is successfully sent", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const result = await sendPasswordReset("user@example.com");
    expect(result).toBe("OK");
  });

  it("returns error message when Firebase returns error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: "EMAIL_NOT_FOUND" },
      }),
    });

    const result = await sendPasswordReset("wrong@example.com");
    expect(result).toBe("EMAIL_NOT_FOUND");
  });

  it("returns fallback message if no error message", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const result = await sendPasswordReset("unknown@example.com");
    expect(result).toBe("Failed to send reset email");
  });

  it("returns error message on network failure", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const result = await sendPasswordReset("user@example.com");
    expect(result).toBe("Network error");
  });
});
