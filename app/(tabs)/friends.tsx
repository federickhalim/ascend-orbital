import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

interface User {
  uid: string;
  username: string;
  totalFocusTime: number;
  streak: number;
  friends?: string[];
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [expandedFriendId, setExpandedFriendId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserIdAndFetch = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) {
        setCurrentUserId(storedId);
        fetchFriendsData(storedId);
      } else {
        console.warn("No userId found in AsyncStorage");
        setLoading(false);
      }
    };

    getUserIdAndFetch();
  }, []);

  const fetchFriendsData = async (userId: string) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) throw new Error("User not found");

      const userData = snapshot.data();
      const friendIds: string[] = userData.friends || [];

      const tempUser: User = {
        uid: userId,
        username: userData.username || "You",
        totalFocusTime: userData.totalFocusTime || 0,
        streak: userData.streak || 0,
        friends: friendIds,
      };
      setCurrentUser(tempUser);

      const friendsData: User[] = [];

      for (const friendId of friendIds) {
        const friendSnap = await getDoc(doc(db, "users", friendId));
        if (friendSnap.exists()) {
          const data = friendSnap.data();
          friendsData.push({
            uid: friendId,
            username: data.username,
            totalFocusTime: data.totalFocusTime || 0,
            streak: data.streak || 0,
          });
        }
      }

      setFriends(friendsData);
    } catch (error) {
      console.error("❌ Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFriendByUsername = async () => {
    if (!newUsername.trim() || !currentUserId) return;
    setIsAdding(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", newUsername.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert(
          "User not found",
          `No user with username "${newUsername}".`
        );
        return;
      }

      const friendDoc = snapshot.docs[0];
      const friendId = friendDoc.id;

      if (friendId === currentUserId) {
        Alert.alert("Invalid", "You cannot add yourself as a friend.");
        return;
      }

      if (currentUser?.uid) {
        const currentRef = doc(db, "users", currentUserId);
        const alreadyFriends = currentUser.friends?.includes(friendId);

        if (alreadyFriends) {
          Alert.alert(
            "Already Friends",
            `${newUsername} is already in your list.`
          );
          return;
        }

        await updateDoc(currentRef, {
          friends: arrayUnion(friendId),
        });

        Alert.alert("Success", `${newUsername} has been added.`);
        setNewUsername("");
        fetchFriendsData(currentUserId);
      }
    } catch (err) {
      console.error("Error adding friend:", err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmRemoveFriend = (friendId: string, username: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFriend(friendId),
        },
      ]
    );
  };

  const removeFriend = async (friendId: string) => {
    try {
      if (!currentUserId) return;
      await updateDoc(doc(db, "users", currentUserId), {
        friends: arrayRemove(friendId),
      });
      setExpandedFriendId(null);
      fetchFriendsData(currentUserId);
    } catch (err) {
      console.error("Error removing friend:", err);
      Alert.alert("Error", "Unable to remove friend.");
    }
  };

  const leaderboardData = [...friends];
  if (currentUser) leaderboardData.push(currentUser);
  leaderboardData.sort((a, b) => b.totalFocusTime - a.totalFocusTime);

  const renderRightActions = (friendId: string, username: string) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => confirmRemoveFriend(friendId, username)}
    >
      <Text style={styles.deleteText}>Remove</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: User; index: number }) => {
    const isMe = item.uid === currentUserId;
    const isExpanded = expandedFriendId === item.uid;

    const cardContent = (
      <TouchableOpacity
        onPress={() => {
          if (isMe) return;
          setExpandedFriendId(isExpanded ? null : item.uid);
        }}
      >
        <View
          style={[
            styles.card,
            isMe && { backgroundColor: "#e6f7ff" },
            isExpanded && { borderWidth: 1, borderColor: "#007bff" },
          ]}
        >
          <Text style={styles.rank}>#{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{isMe ? "You" : item.username}</Text>
            <Text style={styles.meta}>
              Focus Time: {Math.floor(item.totalFocusTime / 60)} mins • Streak:{" "}
              {item.streak}
            </Text>
          </View>
        </View>
        {isExpanded && (
          <View style={styles.actionRow}>
            <Button
              title="Visit Era"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Era feature is not yet implemented."
                )
              }
            />
            <Button
              title="Remove Friend"
              color="#d9534f"
              onPress={() => confirmRemoveFriend(item.uid, item.username)}
            />
          </View>
        )}
      </TouchableOpacity>
    );

    return isMe ? (
      cardContent
    ) : (
      <Swipeable
        renderRightActions={() => renderRightActions(item.uid, item.username)}
      >
        {cardContent}
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>

      <View style={styles.addFriendBox}>
        <TextInput
          placeholder="Enter friend's username"
          value={newUsername}
          onChangeText={setNewUsername}
          style={styles.input}
        />
        <Button
          title={isAdding ? "Adding..." : "Add Friend"}
          onPress={addFriendByUsername}
          disabled={isAdding}
        />
      </View>

      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={<Text style={styles.empty}>No friends yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  addFriendBox: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  rank: { fontWeight: "bold", fontSize: 18, width: 40 },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, color: "#666" },
  empty: { textAlign: "center", color: "#999", marginTop: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});
