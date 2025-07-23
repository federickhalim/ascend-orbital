export const FIREBASE_API_KEY = "AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU";

export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    return { status: "MISSING_FIELDS" };
  }

  // Step 1: Login
  const loginRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    return {
      status: "LOGIN_FAILED",
      message: loginData.error?.message || "Unknown error",
    };
  }

  const idToken = loginData.idToken;
  const localId = loginData.localId;

  // Step 2: Check email verification
  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  const verifyData = await verifyRes.json();
  const isEmailVerified = verifyData.users?.[0]?.emailVerified;

  if (!isEmailVerified) {
    return { status: "UNVERIFIED", idToken };
  }

  // Step 3: Success
  return {
    status: "OK",
    idToken,
    userId: localId,
  };
}

export async function sendEmailVerification(
  idToken: string
): Promise<"OK" | string> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "VERIFY_EMAIL",
          idToken,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return data.error?.message || "Failed to resend email";
    }

    return "OK";
  } catch (error: any) {
    return error.message || "Something went wrong";
  }
}

export async function sendPasswordReset(email: string): Promise<"OK" | string> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=YOUR_API_KEY`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return data.error?.message || "Failed to send reset email";
    }

    return "OK";
  } catch (error: any) {
    return error.message || "Something went wrong";
  }
}
