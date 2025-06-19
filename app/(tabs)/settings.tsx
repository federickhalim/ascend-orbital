import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // ✅ Clear local app state (if any) and go to login screen
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
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
});
