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
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { Image, ImageBackground } from "react-native";
import { ScrollView } from "react-native";

export default function SignupScreen() {
  const FIREBASE_API_KEY = "AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU";
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    // Validate username format
    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validUsernameRegex.test(username)) {
      Alert.alert(
        "Invalid username",
        "Username can only contain letters, numbers, dots (.), underscores (_), and dashes (-)."
      );
      return;
    }

    try {
      const db = getFirestore(app);

      // Step 0: Check if username is already taken
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        Alert.alert("Username taken", "Please choose another username.");
        return;
      }

      // Step 1: Sign up the user
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.message === "EMAIL_EXISTS") {
          Alert.alert("Email already registered", "Please log in instead.");
          return;
        }
        throw new Error(data.error?.message || "Signup failed");
      }

      const uid = data.localId;
      const idToken = data.idToken;

      // Step 2: Save user data to Firestore
      await setDoc(doc(db, "users", uid), {
        username,
        email,
        createdAt: new Date(),
      });

      // Step 3: Send email verification
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken: idToken,
          }),
        }
      );

      Alert.alert(
        "Verify Your Email",
        "Please check your inbox and verify your email before logging in."
      );

      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/login-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/ascend-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Create Account</Text>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#003568"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#003568"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#003568"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  formContainer: {
    width: "100%",
    alignSelf: "center",
  },
  innerWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: -10,
    marginTop: -170,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 35,
    textAlign: "center",
    color: "#003568",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#fff",
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: "#003568",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    color: "#003568",
  },
  eyeIcon: {
    marginLeft: 8,
    color: "#fff",
  },
  button: {
    backgroundColor: "#003568",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  linkText: {
    color: "#003568",
    marginTop: 16,
    textAlign: "center",
  },
});
