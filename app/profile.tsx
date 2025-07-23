import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDoc,
  updateDoc,
  doc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getProfileImageName } from "@/utils/profileUtils";

const profilePics = [
  require("@/assets/images/profile/sphinx-profile.png"),
  require("@/assets/images/profile/griffin-profile.png"),
  require("@/assets/images/profile/robot-profile.png"),
];

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) setUserId(id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || "");
        setPhotoURL(data.photoURL || "");
        setEmail(data.email || "");

        // ✅ Ensure default profile picture if not set
        if (!data.photoURL) {
          await updateDoc(doc(db, "users", userId), {
            photoURL: "sphinx-profile.png",
          });
          setPhotoURL("sphinx-profile.png");
        }
      }
    };
    loadProfile();
  }, [userId]);

  const selectProfilePic = async (index: number) => {
    if (!userId) return;
    const chosen =
      index === 0
        ? "sphinx-profile.png"
        : index === 1
        ? "griffin-profile.png"
        : "robot-profile.png";
    await updateDoc(doc(db, "users", userId), {
      photoURL: chosen,
    });
    setPhotoURL(chosen);
    Alert.alert("Profile picture updated!");
  };

  const saveUsername = async () => {
    if (!userId) return;
    const trimmed = username.trim();

    // 1. Empty check
    if (!trimmed) {
      Alert.alert("Invalid username", "Username cannot be empty.");
      return;
    }

    // 2. Character validation
    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validUsernameRegex.test(trimmed)) {
      Alert.alert(
        "Invalid username",
        "Only letters, numbers, dots, underscores, and dashes are allowed."
      );
      return;
    }

    // 3. Uniqueness check
    const q = query(collection(db, "users"), where("username", "==", trimmed));
    const snapshot = await getDocs(q);
    const isTaken = snapshot.docs.some((docSnap) => docSnap.id !== userId);

    if (isTaken) {
      Alert.alert("Username taken", "Please choose another.");
      return;
    }

    // 4. Save
    await updateDoc(doc(db, "users", userId), {
      username: trimmed,
    });

    Alert.alert("Username updated!");
  };

  const getLocalImage = () => {
    const profileType = getProfileImageName(photoURL || "sphinx-profile.png");
    const index =
      profileType === "griffin" ? 1 : profileType === "robot" ? 2 : 0;
    return profilePics[index];
  };

  return (
    <View style={styles.container}>
      <Image source={getLocalImage()} style={styles.avatar} />
      <Text style={styles.label}>Select a Profile Picture:</Text>
      <View style={styles.picRow}>
        {profilePics.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => selectProfilePic(idx)}>
            <Image
              source={img}
              style={[
                styles.picOption,
                photoURL.includes(["sphinx", "griffin", "robot"][idx])
                  ? styles.selectedPic
                  : {},
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email:</Text>
        <Text>{email || "N/A"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          style={styles.input}
        />
        <Button title="Save Username" onPress={saveUsername} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  picRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  picOption: { width: 64, height: 64, borderRadius: 32 },
  selectedPic: { borderWidth: 2, borderColor: "#007bff" },
  field: { width: "100%", marginVertical: 12 },
  label: { fontSize: 16, marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
});
