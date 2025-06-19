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
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

export default function SignupScreen() {
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

    try {
      // ✅ REST API call to create user
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU`,
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
        throw new Error(data.error.message || "Signup failed");
      }

      const uid = data.localId;

      // ✅ Save username and email to Firestore
      const db = getFirestore(app);
      await setDoc(doc(db, "users", uid), {
        username,
        email,
        createdAt: new Date(),
      });

      Alert.alert("Account created!", "You can now log in.");
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
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

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  linkText: {
    color: "#3b82f6",
    marginTop: 16,
    textAlign: "center",
  },
});
