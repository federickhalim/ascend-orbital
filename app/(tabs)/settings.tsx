import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default function SettingsScreen() {
  const router = useRouter();
  const FIREBASE_API_KEY = "AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU";

  const handleLogout = async () => {
    try {
      // Clear local app state (if any) and go to login screen
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message || "An error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const idToken = await AsyncStorage.getItem("userToken");
              const userId = await AsyncStorage.getItem("userId");
              if (!idToken || !userId) {
                Alert.alert(
                  "Error",
                  "Missing token or user ID. Please log in again."
                );
                return;
              }

              // Delete from Firebase Auth (REST API)
              const authRes = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idToken }),
                }
              );

              if (!authRes.ok) {
                const error = await authRes.json();
                throw new Error(
                  error.error.message || "Failed to delete Auth account"
                );
              }

              // Delete Firestore user document
              await deleteDoc(doc(db, "users", userId));

              // Clear local storage & redirect
              await AsyncStorage.clear();
              router.replace("/login");
            } catch (err: any) {
              Alert.alert(
                "Delete failed",
                err.message || "Something went wrong"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: "#991b1b", marginTop: 20 },
        ]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.logoutText}>Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.clearData,
          { backgroundColor: "#991b1b", marginTop: 20 },
        ]}
        onPress={async () => {
          await AsyncStorage.removeItem("userId");
          await AsyncStorage.removeItem("userToken");
          Alert.alert("Storage cleared");
        }}
      >
        <Text style={styles.logoutText}>Clear Login Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearData: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});
