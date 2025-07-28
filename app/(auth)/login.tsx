import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FontAwesome } from "@expo/vector-icons";
import { Image, ImageBackground } from "react-native";
import { loginUser, sendPasswordReset } from "@/utils/authUtils";

const FIREBASE_API_KEY = "AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [emailSentMessage, setEmailSentMessage] = useState("");

  const handleLogin = async () => {
    const result = await loginUser(email, password);

    switch (result.status) {
      case "MISSING_FIELDS":
        Alert.alert("Missing fields", "Please enter both email and password.");
        return;
      case "LOGIN_FAILED":
        Alert.alert("Login failed", result.message);
        return;
      case "UNVERIFIED":
        console.log("pendingIdToken:", result.idToken);
        setPendingIdToken(result.idToken);
        Alert.alert(
          "Email not verified",
          "Please verify your email before logging in."
        );
        return;
      case "OK":
        await AsyncStorage.setItem("userToken", result.idToken);
        await AsyncStorage.setItem("userId", result.userId);
        router.replace("/(tabs)");
        return;
    }
  };

  const handleResendVerification = async () => {
    try {
      if (!pendingIdToken) return;

      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken: pendingIdToken,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to resend email");
      }

      Alert.alert("Email sent", "Verification email has been resent.");
      setEmailSentMessage("Verification email sent!");
      setTimeout(() => setEmailSentMessage(""), 3000); // hides after 3s

      setPendingIdToken(null); // hide the button after resending
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Missing email",
        "Please enter your email to reset password."
      );
      return;
    }

    const result = await sendPasswordReset(email);

    if (result === "OK") {
      Alert.alert("Email sent", "Check your inbox to reset your password.");
    } else {
      Alert.alert("Error", result);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/login-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/ascend-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subText}>
            Start your productivity journey now!
          </Text>
        </View>
        {/* Email */}
        <View style={styles.inputWrapper}>
          <FontAwesome
            name="envelope"
            size={20}
            color="#003568"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            placeholderTextColor="#003568"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        {/* Password */}
        <View style={styles.inputWrapper}>
          <FontAwesome
            name="key"
            size={20}
            color="#003568"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Password"
            placeholderTextColor="#003568"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#888"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signinButton} onPress={handleLogin}>
          <Text style={styles.signinText}>Sign In</Text>
        </TouchableOpacity>

        {pendingIdToken && (
          <TouchableOpacity onPress={handleResendVerification}>
            <Text style={styles.resendText}>Resend verification email</Text>
          </TouchableOpacity>
        )}

        {emailSentMessage !== "" && (
          <Text style={styles.sentMessage}>{emailSentMessage}</Text>
        )}

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
        <Text style={styles.dividerText}>--------- or ---------</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>
            Don’t have an account?{" "}
            <Text style={{ fontWeight: "bold" }}>Sign up here</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: -10,
    marginTop: -150,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  subText: {
    textAlign: "center",
    //fontWeight: "600",
    fontSize: 19,
    fontWeight: 600,
    color: "#003568",
    marginBottom: 20,
    marginTop: 10,
    fontFamily: Platform.select({
      ios: "Helvetica Neue",
      android: "Roboto",
      default: "System", // fallback
    }),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,

    paddingHorizontal: 16,
    marginBottom: 26,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },

  inputField: {
    flex: 1,
    fontSize: 14,
    color: "#003568",
  },
  signinButton: {
    backgroundColor: "#003568",
    borderRadius: 999,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  signinText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  forgotText: {
    marginTop: 15,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    color: "#003568",
  },
  resendText: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    color: "#003568",
  },
  sentMessage: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
    color: "green",
    fontWeight: "500",
  },

  dividerText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 8,
    color: "#003568",
  },
  signupText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: "#003568",
  },
});
