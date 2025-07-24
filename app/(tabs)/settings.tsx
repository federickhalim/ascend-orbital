import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
// @ts-ignore
import Feather from "react-native-vector-icons/Feather";
// @ts-ignore
import FontAwesome from "react-native-vector-icons/FontAwesome";
// @ts-ignore
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function SettingsScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ username?: string; photoURL?: string }>({});

  const FIREBASE_API_KEY = "YOUR_FIREBASE_API_KEY"; // replace with env!

  useEffect(() => {
    const checkAuth = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (!id) {
        router.replace("/login");
      } else {
        setUserId(id);
      }
    };
    checkAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        if (!userId) return;
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      };
      fetchProfile();
    }, [userId])
  );

  const getLocalImage = () => {
    const local = profile.photoURL || "sphinx-profile.png";
    if (local.includes("sphinx"))
      return require("@/assets/images/profile/sphinx-profile.png");
    if (local.includes("griffin"))
      return require("@/assets/images/profile/griffin-profile.png");
    if (local.includes("robot"))
      return require("@/assets/images/profile/robot-profile.png");
    return require("@/assets/images/profile/sphinx-profile.png");
  };

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userId", "userToken"]);
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const idToken = await AsyncStorage.getItem("userToken");
              if (!idToken || !userId) {
                Alert.alert("Error", "Missing token or user ID. Please log in again.");
                return;
              }

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
                console.error("Firebase delete error:", error);
                throw new Error(error.error.message || "Failed to delete Auth account");
              }

              await deleteDoc(doc(db, "users", userId));
              await AsyncStorage.multiRemove(["userId", "userToken"]);
              router.replace("/login");
            } catch (err: any) {
              Alert.alert("Delete failed", err.message || "Something went wrong");
            }
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert("Confirm Clear", "Are you sure you want to clear login data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userId", "userToken"]);
          Alert.alert("Login data cleared");
        },
      },
    ]);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/settings-profile-bg.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => router.push("/profile")}
        >
          <Image source={getLocalImage()} style={styles.avatar} />
          <View>
            <Text style={styles.profileName}>
              {profile.username || "Unnamed User"}
            </Text>
            <Text style={styles.profileEdit}>View and edit profile</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/analytics")}
          >
            <View style={styles.rowIconText}>
              <MaterialIcons name="insights" size={18} color="#007bff" style={styles.icon} />
              <Text style={styles.itemText}>Focus Analytics Dashboard</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/badges")}
          >
            <View style={styles.rowIconText}>
              <FontAwesome name="trophy" size={18} color="#007bff" style={styles.icon} />
              <Text style={styles.itemText}>Achievement Badges</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <View style={styles.rowIconText}>
              <MaterialIcons name="logout" size={18} color="#007bff" style={styles.icon} />
              <Text style={styles.itemText}>Log Out</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
            <View style={styles.rowIconText}>
              <MaterialIcons name="delete" size={18} color="#dc2626" style={styles.icon} />
              <Text style={[styles.itemText, styles.destructive]}>Delete Account</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleClearData}>
            <View style={styles.rowIconText}>
              <MaterialIcons name="cleaning-services" size={18} color="#dc2626" style={styles.icon} />
              <Text style={[styles.itemText, styles.destructive]}>Clear Login Data</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "transparent" },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: "#ccc",
  },
  profileName: { fontSize: 20, fontWeight: "bold" },
  profileEdit: { color: "#555", marginTop: 4 },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginTop: 24,
    paddingTop: 16,
  },
  item: { paddingVertical: 12 },
  itemText: { fontSize: 16, fontWeight: "600" },
  destructive: { color: "#dc2626" },
  rowIconText: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
});
